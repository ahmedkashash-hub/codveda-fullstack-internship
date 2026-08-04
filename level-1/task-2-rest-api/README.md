# Level 1 - Task 2: Products REST API

A simple Express CRUD API backed by an in-memory array. Data resets whenever the
server restarts.

## Run

```bash
node src/server.js
```

The API runs at `http://localhost:3000/products`.

## Endpoints

| Method | URL | Success status | Purpose |
| --- | --- | --- | --- |
| GET | `/products` | 200 | List products |
| GET | `/products/:id` | 200 | Get one product |
| POST | `/products` | 201 | Create a product |
| PUT | `/products/:id` | 200 | Update supplied fields |
| DELETE | `/products/:id` | 204 | Delete a product |

POST requires both fields. PUT accepts either or both fields:

```json
{
  "name": "Mouse",
  "price": 25.5
}
```

## Thunder Client or Postman checklist

1. Send `GET /products` and expect `200`.
2. Send `GET /products/1` and expect `200`.
3. Send `POST /products` with the example body and expect `201`.
4. Copy the returned ID, send `PUT /products/{id}`, and expect `200`.
5. Send `DELETE /products/{id}` and expect `204` with no response body.
6. Request the deleted ID and expect `404`.
7. Use an invalid ID such as `abc` and expect `400`.
8. POST an empty name or negative price and expect `400`.
