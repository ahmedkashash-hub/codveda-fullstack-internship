# Generic Deployment Guide

This application is deployment-ready but has not been deployed by this repository task. Configure platform-specific networking, domains, TLS, and secret management in the chosen hosting environment.

## Client

Set `VITE_API_BASE_URL` to the public Express API base URL before building, including `/api`.

```bash
cd client
npm install
npm run build
```

Publish the generated `client/dist/` directory as a static site. Configure the host to serve `index.html` for client-side React Router paths. `npm run preview` may be used to inspect the production build locally; it is not a production web server.

## Server

Provide these environment variables through the deployment platform's secret/configuration system:

- `DATABASE_URL` — PostgreSQL connection URL.
- `JWT_SECRET` — strong private JWT signing secret.
- `JWT_EXPIRES_IN` — token duration such as `1h`.
- `CLIENT_ORIGIN` — exact deployed client origin, without a wildcard.
- `PORT` — HTTP port supplied by or configured for the host.

Then install, generate the Prisma Client, apply committed migrations, and start:

```bash
cd server
npm install
npx prisma generate
npm run db:deploy
npm start
```

The server binds to all interfaces by default for hosted environments. `HOST` may optionally override the bind address. Run migrations once as a release step rather than concurrently from every application replica.

## Database

Provision PostgreSQL, set `DATABASE_URL`, and ensure the server can reach it. `prisma migrate deploy` applies existing production migrations without resetting data or creating development migrations. The database-backed `/health` endpoint can be used for a generic readiness check.
