# Codveda Level 3 — Task 3

## GraphQL API Development

### Overview

A review-ready product-catalog API built with Express 5, Apollo Server, GraphQL, Prisma, and PostgreSQL. It provides typed catalog queries and mutations, JWT authentication, role authorization, safe errors, database pagination/filtering, and request-scoped DataLoader relation batching.

### Requirements

- Node.js 20 or newer
- PostgreSQL
- npm

### Technologies

Node.js ES modules, Express 5, Apollo Server, GraphQL, Prisma, PostgreSQL, bcrypt, JSON Web Tokens, and DataLoader.

### Architecture

```text
HTTP Request
→ Apollo
→ Context
→ Authentication
→ Resolver
→ Authorization
→ Service
→ Prisma
→ PostgreSQL
```

Relation fields use:

```text
Field Resolver → Request-scoped DataLoader → Batched Prisma query
```

Resolvers stay thin. Services own validation, normalization, database operations, and safe error translation. One shared Prisma client serves services and request-created loaders.

### Database Models

- `Category`: UUID, unique name, optional description, timestamps, products.
- `Product`: UUID, unique SKU, exact `NUMERIC(12,2)` price, stock, active status, required category, timestamps.
- `User`: UUID, normalized unique email, bcrypt hash, `USER`/`ADMIN` role, timestamps.

`Product.categoryId` uses `ON DELETE RESTRICT`, so category deletion never cascade-deletes products.

### GraphQL Schema

The schema is modularized into base, auth, category, product, and mutation definitions. Public user output deliberately has no password field. Category/Product relation fields are non-null and resolved through preloaded mutation data or DataLoader.

### Queries

- `health`
- `categories`, `category(id)`
- `products(page, limit, search, categoryId, isActive)`, `product(id)`
- `currentUser` (authenticated)

### Mutations

- Public: `register`, `login`
- ADMIN: `createCategory`, `updateCategory`, `deleteCategory`
- USER or ADMIN: `createProduct`, `updateProduct`
- ADMIN: `deleteProduct`

Updates are partial and reject empty inputs. Product deletion is permanent. Category deletion is blocked while products reference it.

### Authentication

Registration always creates `USER` and does not issue a token. Login returns a JWT. Send it as:

```http
Authorization: Bearer <token>
```

JWTs use HS256 and contain only `sub`, server-issued `role`, `iat`, and `exp`. Passwords use bcrypt cost 10; plaintext and hashes never enter GraphQL responses or tokens. Test administrators are created internally with Prisma—public admin creation does not exist.

### Authorization

| Operations | Access |
| --- | --- |
| Health and catalog reads | Public |
| Register and login | Public |
| Current user | Authenticated |
| Category writes | ADMIN |
| Product create/update | USER or ADMIN |
| Product delete | ADMIN |

### Apollo Context

Each request receives `{ auth, loaders }`. `auth` is either `null` or the verified `{ userId, role }`; raw JWT payloads are not attached. Every request receives new DataLoader instances.

### DataLoader

- `categoryById`: batches product category IDs into one `Category.findMany` query and preserves key order; missing IDs return `null`.
- `productsByCategoryId`: batches category IDs into one `Product.findMany`, groups results, returns `[]` for empty categories, and orders products by name then ID.

The default cache lives for one HTTP GraphQL request only. Repeated keys within that request are deduplicated; the next request starts with an empty cache. There is no Redis or global relation cache.

Mutation results intentionally preload their immediate relationship. This avoids reading potentially stale loader entries when returning changed data without introducing complex invalidation infrastructure.

### N+1 Problem

Previously, deep relation fallbacks could issue one query per parent. Read queries now avoid eager relation overfetching and field resolvers batch missing relations. Products-with-categories uses one category batch, categories-with-products uses one product batch, and Category → Products → Category uses two bounded relation batches rather than a query per row.

### Pagination

Products default to page 1 and limit 10. Page and limit must be positive integers; limit is capped at 100. Prisma performs `skip`, `take`, and filtered count operations in PostgreSQL.

### Search and Filtering

Name/SKU search is case-insensitive and database-side. `categoryId` and `isActive` filters are included in the Prisma `where` clause; records are never fetched wholesale for JavaScript filtering.

### Decimal Handling

Prices enter GraphQL as validated decimal strings, remain Prisma Decimal/PostgreSQL `NUMERIC(12,2)`, and return as fixed two-decimal strings. JavaScript floating point is not used for money.

### Error Contracts

The API uses `BAD_USER_INPUT`, `NOT_FOUND`, `CONFLICT`, `UNAUTHENTICATED`, `FORBIDDEN`, and `INTERNAL_SERVER_ERROR`. Responses do not expose Prisma codes, SQL, stack traces, JWT errors, credentials, or connection details.

### Security

The JSON request body is limited to 100 KB. JWT configuration has no insecure fallback, authorization is centralized, auth-variable coercion errors are sanitized, and graceful shutdown closes HTTP, Apollo, and Prisma once on SIGINT/SIGTERM. Helmet was not added because Step 5 limits new dependencies to DataLoader; it would harden HTTP headers, not GraphQL authorization.

### Performance

Relation query counts are bounded and do not grow linearly with parent rows. Existing indexes match current reads: product `(categoryId, isActive)`, product name, unique product SKU, and unique category name. No speculative index or migration was added.

### Environment Variables

```dotenv
PORT=3002
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/codveda_level3_graphql
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=replace-with-a-strong-secret
JWT_EXPIRES_IN=1h
```

Copy `.env.example` to an ignored `.env` and replace placeholders. Never commit real secrets.

### Prisma Migrations

- `init_product_catalog`
- `add_authentication`

DataLoader changes no database structure, so Step 5 requires no migration or index change.

### Running

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

REST health is `GET /health`; GraphQL is `POST /graphql`.

### Example GraphQL Operations

```graphql
query Catalog {
  products(page: 1, limit: 5, search: "book", isActive: true) {
    nodes { id name sku price category { id name } }
    pageInfo { page limit totalItems totalPages }
  }
}

mutation Login {
  login(input: { email: "user@example.com", password: "StrongPass123" }) {
    token
    user { id name role }
  }
}

mutation CreateProduct($categoryId: ID!) {
  createProduct(input: {
    name: "Monitor Arm"
    sku: "ARM-001"
    price: "49.90"
    categoryId: $categoryId
  }) {
    product { id name price category { name } }
  }
}
```

### Limitations

Recursive Category/Product selections can still create very deep response work even though relation queries are batched. Pagination caps limit list breadth, but no query-depth/complexity plugin was added because no suitable maintained dependency-free safeguard fits the current Apollo stack. Introspection remains enabled intentionally for internship review and learning; deployment owners may set an explicit landing-page policy by environment. There is no Redis, frontend, subscription, WebSocket, ownership model, refresh token, or global cache.

### What I Learned

This task demonstrates modular GraphQL design, Prisma constraints, exact decimal handling, safe authentication and authorization, thin resolver/service separation, request-local batching, cache-scope decisions, N+1 measurement, and secure error boundaries.

See [documentation/graphql-design.md](documentation/graphql-design.md) for deeper implementation details.
