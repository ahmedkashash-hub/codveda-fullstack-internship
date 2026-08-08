# Server

Express and Socket.io share one Node HTTP server. `server.js` loads configuration, creates HTTP, initializes Socket.io, and handles graceful shutdown; event logic lives in focused socket modules.

## Setup

Configure `PORT` and exact `CLIENT_ORIGIN` in an ignored `.env` file:

```bash
npm install
npm run dev
```

Use `npm start` without file watching. `GET /health` reports HTTP service health. Helmet supplies HTTP security headers only; it is not Socket.io authentication.

## Identity, rooms, and validation

Middleware validates temporary handshake `userId` and `displayName`, then stores normalized values in `socket.data`. Identity is spoofable and is **not authentication**. The server joins sockets to `all-users` and derived `user:<userId>` rooms; clients cannot choose rooms.

Shared utilities validate user IDs, messages, notification types, titles, and content. Business events acknowledge `{ ok: true, ... }` or `{ ok: false, error }` without internal details.

## Events

- `client:ping` → socket-scoped `server:pong`
- `client:broadcast` → sender-included `server:broadcast` in `all-users`
- `client:user-message` → `server:user-message` in one user room
- `client:send-notification` → UUID-backed `server:notification` in one user room
- `server:presence` → logical online-user snapshot

## Presence registry

The in-memory registry maps each user ID to a set of socket IDs and one normalized display name. Additional sockets do not duplicate a logical user. Final disconnection removes the user. No event or notification content is stored server-side.

## CORS and limitations

HTTP and Socket.io origins are restricted by environment-configured `CLIENT_ORIGIN`, including a Socket.io `allowRequest` check. There is no database, Redis, JWT, persistence, secure private messaging, offline replay, or full chat.
