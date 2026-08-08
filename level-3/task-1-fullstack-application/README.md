# Codveda Level 3 — Task 1

A deployment-ready task-management application built with the PERN stack: PostgreSQL, Express, React, and Node.js. Users can register, sign in, restore authenticated sessions, and manage only their own tasks through a responsive client.

The application is prepared for generic deployment but has not been externally deployed as part of this task.

## Architecture

```text
React + React Router
        ↓ Axios / JWT
Express API
        ↓ Prisma
PostgreSQL
```

- `client/` contains the Vite React application, authentication context, protected routing, task UI, and API services.
- `server/` contains Express routes, controllers, services, authentication middleware, Prisma, and PostgreSQL migrations.
- `deployment/` documents a provider-neutral production release process.

## Features

- Registration and login with bcrypt password hashing and signed JWTs.
- Backend-authoritative session restoration through `/api/auth/me`.
- Protected task creation, listing, editing, and deletion.
- Owner isolation enforced in Prisma predicates; cross-user task access returns HTTP 404.
- ADMIN-only `/api/admin/dashboard` authorization; public registration always creates USER.
- Server-side search, status/priority filters, allowlisted sorting, counting, and pagination.
- Responsive task dashboard with loading, retryable error, empty, and no-match states.
- Database-backed health check, restricted CORS, Helmet security headers, bounded JSON bodies, and graceful shutdown.

## Database design

`User` has a one-to-many relationship with `Task`. Tasks use `TODO | IN_PROGRESS | DONE` status and `LOW | MEDIUM | HIGH` priority enums. Deleting a user cascades to their owned tasks. Indexes cover owner/status access, priority filtering, and due-date access; unique email is enforced by PostgreSQL.

Task lists use Prisma `skip`, `take`, and `count`. Filtering and case-insensitive search execute in PostgreSQL, sort fields are allowlisted, and no client-side full-list filtering or N+1 query pattern is used.

## Environment

Copy the example files to ignored local `.env` files and replace placeholders:

```bash
Copy-Item client/.env.example client/.env
Copy-Item server/.env.example server/.env
```

Client:

- `VITE_API_BASE_URL` — Express API URL including `/api`.

Server:

- `DATABASE_URL` — PostgreSQL connection URL.
- `JWT_SECRET` — strong private signing secret.
- `JWT_EXPIRES_IN` — JWT duration.
- `CLIENT_ORIGIN` — exact React origin allowed by CORS.
- `PORT` — server port.

Never commit either `.env` file. The JWT secret and database URL are server-only.

## Development

Install and run each workspace in a separate terminal:

```bash
cd client
npm install
npm run dev
```

```bash
cd server
npm install
npx prisma generate
npm run dev
```

## Production build

```bash
cd client
npm run build
```

The static output is written to `client/dist/`.

Prepare and start the API with:

```bash
cd server
npm install
npx prisma generate
npm run db:deploy
npm start
```

See [deployment/README.md](deployment/README.md) for provider-neutral deployment preparation. Actual hosting, domains, and TLS remain external deployment responsibilities.

## Role-based access

`GET /api/admin/dashboard` requires a valid ADMIN JWT. A normal USER receives HTTP 403, missing or invalid authentication receives HTTP 401, and a trusted internal administrator receives HTTP 200. Public registration and client-supplied role fields cannot create an administrator.
