# Codveda Level 2 — Task 2

## Authentication and Authorization API

### Purpose

This project is the backend foundation for Codveda Level 2 Task 2. Step 1 establishes a small Express API and project structure; signup, login, JWT authentication, password hashing, protected routes, and role-based authorization will be implemented incrementally in later steps.

### Technologies

- Node.js
- Express
- JavaScript with ES Modules
- dotenv
- bcrypt
- jsonwebtoken
- nodemon for development

### Setup

Install dependencies:

```bash
npm install
```

Copy `.env.example` to `.env` and replace placeholder values when local configuration is needed. Never commit `.env`.

### Environment Variables

| Variable | Purpose | Example |
| --- | --- | --- |
| `PORT` | HTTP server port | `3000` |
| `JWT_SECRET` | Secret used for JWT signing and verification | `replace-with-a-strong-secret` |
| `JWT_EXPIRES_IN` | JWT lifetime | `1h` |

The current health endpoint does not require JWT configuration.

### npm Scripts

- `npm run dev` starts the API with nodemon and watches for changes.
- `npm start` starts the API with Node.js.

### Health Endpoint

`GET /health` returns HTTP 200 with:

```json
{
  "status": "ok",
  "service": "authentication-api"
}
```

### Register a User

`POST /api/auth/register` accepts:

```json
{
  "name": "Ahmed Mohammed",
  "email": "ahmed@example.com",
  "password": "StrongPass123"
}
```

A successful registration returns HTTP 201:

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "generated-uuid",
    "name": "Ahmed Mohammed",
    "email": "ahmed@example.com",
    "role": "user",
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
}
```

Invalid names, email addresses, or passwords shorter than eight characters return HTTP 400. An email that is already registered returns HTTP 409, including when different letter casing is used.

Passwords are hashed with bcrypt and never included in responses. Users are stored temporarily in memory and are lost whenever the API restarts. Protected routes, role-based authorization, and database persistence are not implemented yet.

### Log In

`POST /api/auth/login` accepts:

```json
{
  "email": "ahmed@example.com",
  "password": "StrongPass123"
}
```

A successful login returns HTTP 200 with safe user data and a signed token:

```json
{
  "message": "Login successful",
  "user": {
    "id": "generated-uuid",
    "name": "Ahmed Mohammed",
    "email": "ahmed@example.com",
    "role": "user",
    "createdAt": "2026-01-01T00:00:00.000Z"
  },
  "token": "signed-jwt"
}
```

Unknown emails and incorrect passwords both return HTTP 401:

```json
{
  "message": "Invalid email or password"
}
```

Missing or invalid login fields return HTTP 400. Set a strong, private `JWT_SECRET` and a valid `JWT_EXPIRES_IN` value in the local environment before logging in. The API does not use a fallback JWT secret, and secrets must not be committed.

JWTs contain only the user's ID (`sub`), role, and standard timestamps. Role-based authorization is not implemented yet.

### Current User Profile

`GET /api/users/me` is a protected route. Send the login token with the standard Bearer scheme:

```http
Authorization: Bearer <token>
```

A valid token returns HTTP 200:

```json
{
  "user": {
    "id": "generated-uuid",
    "name": "Ahmed Mohammed",
    "email": "ahmed@example.com",
    "role": "user",
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
}
```

Missing credentials return HTTP 401 with `{ "message": "Authentication required" }`. Invalid or expired tokens return HTTP 401 with `{ "message": "Invalid or expired token" }`.

Protected routes verify the token before allowing the request to reach its controller. The profile identity comes only from the verified token, never from query parameters, request bodies, or custom identity headers. Authentication and role-based authorization remain separate middleware responsibilities.

### Admin Dashboard

`GET /api/admin/dashboard` demonstrates role-based authorization. It requires a valid admin JWT:

```http
Authorization: Bearer <admin-token>
```

The middleware pipeline is:

```text
authenticate → authorize("admin") → getDashboard
```

An authenticated admin receives HTTP 200:

```json
{
  "message": "Welcome to the admin dashboard"
}
```

Authentication establishes who made the request by verifying the JWT. Authorization then decides whether that authenticated role may access the route. Missing or invalid authentication returns HTTP 401, while an authenticated user without the required role receives HTTP 403 with `{ "message": "Forbidden" }`.

Public registration always creates a normal `user`, even if the request supplies another role. There is no public admin-registration or role-management endpoint, and roles remain in temporary memory rather than a database.
