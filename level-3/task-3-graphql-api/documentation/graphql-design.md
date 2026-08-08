# GraphQL design

## Modular schema

Base, authentication, category, product, and mutation SDL modules are composed in `src/graphql/schemas/index.js`. Resolver modules are composed separately. Query and mutation resolvers delegate business work to services; relation resolvers delegate missing relations to request-scoped loaders.

## Request and operation flow

```text
HTTP Request
→ Apollo Context
→ JWT verification
→ context.auth + context.loaders
→ Resolver authorization
→ Service
→ Shared Prisma client
→ PostgreSQL
```

Public reads skip authorization. Protected resolvers call centralized `requireAuth` or `requireRole`; they never verify JWTs or access Prisma directly.

## Authentication and authorization

Authentication verifies an HS256 Bearer token and establishes `{ userId, role }`. Authorization applies the verified server-issued role: reads/register/login are public, `currentUser` requires identity, category writes require ADMIN, product create/update allow USER or ADMIN, and product deletion requires ADMIN.

Invalid tokens produce no identity and expose no jsonwebtoken details. Public registration can only create USER. Passwords are bcrypt-hashed and no password hash appears in GraphQL or JWT claims.

## Query and mutation behavior

Services validate UUIDs and inputs, normalize whitespace/SKUs/descriptions, preserve omitted update fields, convert Decimal values to fixed strings, translate expected Prisma failures, and issue database operations. Pagination, count, search, and filtering remain in PostgreSQL.

Mutation objects preload immediate relations. Since GraphQL mutation fields execute serially, preloading ensures returned changed data does not depend on an earlier loader cache entry. This is simpler than mutation-wide invalidation and correct for current payloads.

## Relation resolution and N+1 optimization

Before Step 5, normal paths eagerly included relations while fallback relation fields could perform one Prisma lookup per parent on deeper selections. Eager loading also fetched relations when clients did not request them.

Now catalog root reads fetch only their own records. `Product.category` reuses a preloaded category or calls `categoryById`; `Category.products` reuses preloaded products or calls `productsByCategoryId`.

Each loader executes at most one batch for keys scheduled in the same event-loop frame:

- category IDs use one `Category.findMany({ id: { in: keys } })` and are remapped to exact key order; missing categories return `null`;
- category IDs use one `Product.findMany({ categoryId: { in: keys } })`, then group results; empty categories return `[]`; products order by name then ID.

Products → Category therefore uses one relation batch regardless of product count. Categories → Products uses one relation batch regardless of category count. Category → Products → Category uses two bounded relation batches. Repeated IDs are deduplicated by DataLoader.

## Request scope and caching

Apollo creates new loaders inside every context. Default DataLoader caching exists only for that request/operation, so repeated relation keys reuse a result without leaking data to later requests or other users. The following HTTP request receives new loader objects and empty caches. No global cache or Redis exists.

Loaders contain no authentication or authorization rules. They are reachable only after the root GraphQL operation has passed its normal access policy.

## Performance and indexes

Verification counts loader batches without exposing SQL logs to clients. Products-with-categories and categories-with-products each require one relation batch; the deep query requires two. Repeated category IDs in one request are sent once, while a new request performs a fresh batch.

Current indexes match query patterns: `Product(categoryId, isActive)`, `Product(name)`, unique `Product.sku`, and unique `Category.name`. No speculative index or schema migration is required for DataLoader.

## Safety and limitations

The request JSON limit is 100 KB and product pages are capped at 100. Safe GraphQL errors hide database, JWT, stack, and credential details. SIGINT/SIGTERM shutdown is idempotent and closes HTTP, Apollo, then Prisma.

The Category/Product schema permits recursive nested selections. DataLoader bounds database relation queries, but it does not cap parsing, validation, or response depth. No depth/complexity dependency was added blindly; this risk is documented for a future maintained validation rule. Introspection remains enabled for internship inspection. Apollo's environment-dependent default landing behavior is retained intentionally.
