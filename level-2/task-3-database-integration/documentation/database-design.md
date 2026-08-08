# Database Design

## Relationship

```text
Category 1 ────── * Product
```

Categories are stored separately so their identity and descriptive data are consistent across many products. `Product` owns the required `categoryId` foreign key, so every product belongs to exactly one category while a category may contain many products.

Category deletion uses `RESTRICT`: PostgreSQL refuses to delete a category while products reference it. This avoids accidental product deletion. Foreign-key updates cascade so related identifiers remain consistent.

## Constraints

- UUID primary keys identify both tables.
- `Category.name` and `Product.sku` are unique.
- Required scalar fields and `Product.categoryId` are `NOT NULL`.
- The foreign key guarantees that every product category exists.

## Indexes

Unique constraints already index category names and product SKUs. A compound product index on `(categoryId, isActive)` supports category listings and active-product filtering while also serving lookups by `categoryId`. A separate index on `Product.name` supports name-based ordering and exact/prefix query patterns. A standalone Boolean index was avoided because its low selectivity is rarely useful by itself.

## Money

`Product.price` uses PostgreSQL `DECIMAL(12,2)`. Decimal arithmetic preserves exact currency values; floating-point types can introduce rounding errors.

## Validation Boundary

The database enforces structure, required fields, uniqueness, relationships, and numeric storage types. The service layer validates business rules such as non-negative prices and stock, input lengths, UUID shape, and trimmed names before issuing Prisma queries. These rules are not duplicated as incomplete schema-level validation.

## Query and Deletion Behavior

Product pagination, search, category/status filtering, and sorting are translated into PostgreSQL queries through Prisma. `skip` and `take` prevent full-table loading, and a separate database count supplies pagination metadata. The current B-tree indexes support category/status filtering, names, and unique SKU lookup. No speculative search index was added; substring-search indexing should follow measured production needs.

Category deletion continues to rely on the foreign key's `RESTRICT` action. The API translates that database protection into HTTP 409 and never cascade-deletes related products.
