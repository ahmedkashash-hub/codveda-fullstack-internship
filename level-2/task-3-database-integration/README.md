# Codveda Level 2 — Task 3

## Database Integration

### Overview

This project is a PostgreSQL-backed product catalog API built with Node.js, Express, Prisma ORM, and JavaScript ES Modules. It demonstrates relational schema design, migrations, complete Category/Product CRUD, application validation, exact Decimal money handling, and production-oriented product listing queries.

### Internship Requirements

The project fulfills Codveda Level 2 Task 3 through a real PostgreSQL integration, Prisma models and migration history, a one-to-many relationship, database constraints and indexes, layered API architecture, safe error handling, seed data, and verified database operations. Authentication is intentionally outside this task.

### Technologies

- Node.js
- Express 5
- PostgreSQL
- Prisma ORM and Prisma Client 6
- JavaScript with ES Modules

### Architecture

```text
Routes → Controllers → Services → Prisma → PostgreSQL
```

- Routes define HTTP endpoints and middleware order.
- Controllers coordinate request input and HTTP responses.
- Services validate and normalize data, enforce application rules, translate known database errors, and execute Prisma queries.
- A shared Prisma Client provides database access.
- PostgreSQL enforces relational and structural integrity.

### Database Design

```text
Category 1 ────── * Product
```

`Product.categoryId` owns the required foreign key. Every product belongs to one category, while a category may contain many products. PostgreSQL restricts category deletion while products reference it.

### Database Constraints

- UUID primary keys on Category and Product
- Unique `Category.name`
- Unique `Product.sku`
- Required product name, SKU, price, stock, active status, and category
- `Product.categoryId` foreign key
- `ON DELETE RESTRICT` and `ON UPDATE CASCADE`
- PostgreSQL `NUMERIC(12,2)` for exact prices
- Created and automatically updated timestamps

### Indexing Strategy

- Unique indexes support category-name and SKU lookups.
- `(categoryId, isActive)` supports category/status listings.
- `Product.name` supports name ordering and suitable name queries.
- No speculative substring-search index is included; specialized indexing should follow measured workload needs.

### Validation Rules

Categories:

- Name is trimmed, required, and 2–100 characters.
- Description is optional, trimmed, and limited to 500 characters.

Products:

- Name is trimmed, required, and 2–120 characters.
- Description is optional, trimmed, and limited to 1,000 characters.
- SKU is trimmed, uppercased, required, and 2–64 characters.
- Price is a non-negative decimal string with at most ten integer digits and two fractional digits.
- Stock is a non-negative integer.
- `isActive` is Boolean.
- `categoryId` is a valid UUID referencing an existing category.

Query parameters are also validated and never passed into Prisma as arbitrary field names.

### API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Check API and PostgreSQL connectivity |
| `POST` | `/api/categories` | Create a category |
| `GET` | `/api/categories` | List categories with product counts |
| `PATCH` | `/api/categories/:id` | Partially update a category |
| `DELETE` | `/api/categories/:id` | Delete an empty category |
| `POST` | `/api/products` | Create a product |
| `GET` | `/api/products` | Query paginated products |
| `GET` | `/api/products/:id` | Get one product |
| `PATCH` | `/api/products/:id` | Partially update a product |
| `DELETE` | `/api/products/:id` | Permanently delete a product |

### Pagination

`GET /api/products` accepts `page` and `limit`. Defaults are page 1 and limit 10; the maximum limit is 100. Prisma applies `skip` and `take` in PostgreSQL and runs a filtered count for metadata:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 0,
    "totalPages": 0
  }
}
```

### Search

The optional `search` parameter performs a case-insensitive PostgreSQL substring search across product name and SKU.

### Filtering

- `categoryId`: valid UUID
- `isActive`: exactly `true` or `false`

Filtering occurs in the Prisma `where` clause rather than in application memory.

### Sorting

- `sortBy`: `name`, `price`, `stock`, or `createdAt`
- `sortOrder`: `asc` or `desc`
- Default: `createdAt desc`

An ID-based secondary order keeps pagination stable.

### HTTP Status Codes

- `200 OK`: successful reads and updates
- `201 Created`: successful creates
- `204 No Content`: successful deletes
- `400 Bad Request`: invalid body, path, or query input
- `404 Not Found`: missing product or category
- `409 Conflict`: duplicate unique value or restricted category deletion
- `500 Internal Server Error`: unexpected failure with a safe generic response
- `503 Service Unavailable`: database health check failure

### Installation

```bash
npm install
```

### Environment Setup

Copy `.env.example` to `.env` and replace the placeholder with a local PostgreSQL connection URL. URL-encode special password characters. `.env` is gitignored and must never be committed.

### Prisma Commands

```bash
npx prisma format
npx prisma validate
npx prisma generate
npx prisma migrate dev --name descriptive_migration_name
npx prisma migrate status
npx prisma studio
```

### Seed Data

Seed three categories and eight realistic products:

```bash
npm run db:seed
```

The seed uses upserts, so it is safe to run repeatedly and does not delete unrelated records.

### Running

Development mode with Node's built-in watcher:

```bash
npm run dev
```

Standard start:

```bash
npm start
```

The API uses `PORT` when provided and defaults to port 3000.

### Example Requests

Create a product:

```http
POST /api/products
Content-Type: application/json

{
  "name": "Wireless Keyboard",
  "description": "Compact wireless keyboard",
  "sku": "kb-001",
  "price": "49.99",
  "stock": 15,
  "categoryId": "category-uuid"
}
```

Prices are returned consistently as fixed two-decimal strings, such as `"49.99"`.

Query products:

```http
GET /api/products?page=2&limit=5&search=keyboard&isActive=true&sortBy=price&sortOrder=asc
```

Partially update stock:

```http
PATCH /api/products/product-uuid
Content-Type: application/json

{
  "stock": 20
}
```

### Security / Error Safety

- Controllers do not access Prisma directly.
- Arbitrary sorting fields and filter values are rejected.
- Stack traces, SQL, Prisma error codes, and connection details are never returned to clients.
- The connection URL remains in an ignored local environment file.
- Category deletion never cascades to products.
- Authentication is not implemented or claimed by this project.

### What I Learned

- Designing relational Prisma models and PostgreSQL constraints
- Applying and inspecting real migrations
- Separating routes, controllers, services, and database access
- Preserving exact currency values with Decimal
- Translating database conflicts into safe HTTP responses
- Implementing server-side pagination, search, filtering, and sorting
- Writing idempotent development seeds and safe regression tests

More design rationale is available in `documentation/database-design.md`.
