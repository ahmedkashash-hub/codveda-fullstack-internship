# Server

Node.js API built with Express, with PostgreSQL access managed through one shared Prisma Client instance.

## Database model

- `User` stores a UUID, name, unique email, password hash, role, and timestamps.
- `Task` stores a UUID, task details, workflow state, priority, optional due date, owner, and timestamps.
- One user owns many tasks through the required `Task.ownerId` foreign key.
- Deleting a user cascades to their tasks. This is appropriate because tasks are owned records without an independent lifecycle once their user is removed.

The `Role` enum contains `USER` and `ADMIN`. `TaskStatus` contains `TODO`, `IN_PROGRESS`, and `DONE`. `TaskPriority` contains `LOW`, `MEDIUM`, and `HIGH`.

Task indexes support common access patterns: `(ownerId, status)` for an owner's filtered task list, `priority` for priority filtering, and `dueDate` for deadline queries. The unique email constraint already creates its required unique index and is not duplicated.

## Environment

Copy `.env.example` to `.env` and provide the local connection details for the `codveda_level3` PostgreSQL database. Keep `.env` private.

## Commands

```bash
npm install
npx prisma generate
npm run dev
```

Start without file watching with:

```bash
npm start
```

Validate the Prisma schema with `npx prisma validate`.

Format and migrate schema changes with:

```bash
npx prisma format
npx prisma validate
npx prisma generate
npx prisma migrate dev --name init_task_management
```

## Health check

`GET /health` performs a minimal PostgreSQL connectivity query. It returns HTTP 200 with `database: "postgresql"` when the database is reachable, or HTTP 503 with a generic unavailable status when it is not. Connection details are never returned.

Helmet supplies standard HTTP security headers, and JSON request bodies are limited to 100 KB. The production server reads `PORT`, binds to `0.0.0.0` by default, stops accepting requests on `SIGINT`/`SIGTERM`, closes the HTTP server, and disconnects Prisma before exiting.

## Backend authentication

Configure `JWT_SECRET` with a strong private value and set `JWT_EXPIRES_IN` (for example, `1h`) in the ignored local `.env` file.

Available authentication endpoints:

- `POST /api/auth/register` creates a `USER` account after validating and normalizing input. Passwords are hashed with bcrypt using 10 salt rounds.
- `POST /api/auth/login` verifies credentials and returns a signed JWT containing only the user ID (`sub`) and role.
- `GET /api/auth/me` returns the current database user and requires `Authorization: Bearer <token>`.

Authentication errors use safe responses without Prisma details, SQL, stack traces, secrets, or password hashes. Unknown emails and incorrect passwords receive the same response. Public registration always assigns the `USER` role regardless of client-supplied role data.

`GET /api/admin/dashboard` requires authentication and the `ADMIN` role. Public registration always creates `USER`; bootstrap/test administrators must be created through a trusted internal Prisma workflow.

## Authenticated task API

Every `/api/tasks` endpoint requires `Authorization: Bearer <token>`. Task ownership always comes from the verified JWT user ID; client-provided ownership fields are rejected.

- `POST /api/tasks` creates a task for the authenticated user.
- `GET /api/tasks` lists only the authenticated user's tasks.
- `GET /api/tasks/:id` returns an owned task.
- `PATCH /api/tasks/:id` partially updates an owned task.
- `DELETE /api/tasks/:id` deletes an owned task and returns HTTP 204.

Tasks contain a title, optional description, `TODO | IN_PROGRESS | DONE` status, `LOW | MEDIUM | HIGH` priority, optional due date, ownership, and timestamps. Due dates accept valid ISO date-time strings and are normalized to UTC by PostgreSQL/Prisma. Sending `null` in an update removes a due date; creation requires an ISO string when `dueDate` is supplied.

List queries support `page` and `limit` (default 1 and 10, maximum limit 100), status and priority filters, case-insensitive PostgreSQL search across title and description, and sorting. Allowed sort fields are `title`, `status`, `priority`, `dueDate`, `createdAt`, and `updatedAt`; order is `asc` or `desc`, defaulting to newest creation first.

Ownership is included directly in Prisma query predicates. Missing tasks and tasks owned by another user both return HTTP 404 so the API does not disclose cross-user record existence.

The React client integrates the authenticated task API. The ADMIN dashboard is an API-level authorization demonstration and does not add a separate admin client page.

## CORS

Set `CLIENT_ORIGIN` to the exact React origin, such as `http://localhost:5173`. CORS permits that configured origin and the `Authorization` and `Content-Type` headers; it does not use a wildcard. Requests without a browser origin remain available for server-to-server and command-line use.

For production releases, apply committed migrations with `npm run db:deploy`. See `../deployment/README.md` for the generic deployment sequence.
