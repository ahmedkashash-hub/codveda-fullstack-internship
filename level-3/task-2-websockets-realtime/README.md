# Codveda Level 3 — Task 2

## WebSockets for Real-Time Communication

### Overview

A review-ready Socket.io project demonstrating bidirectional events, server-controlled rooms, user-specific delivery, real-time notifications, and logical online presence in a responsive React diagnostics dashboard.

### Internship Requirements

The project integrates Socket.io with Express and React, shares one Node HTTP server, supports global and user-room delivery, tracks multi-socket presence efficiently, uses acknowledgements and safe validation, and cleans up listeners across disconnects and reconnects.

### Technologies

- React, Vite, and `socket.io-client`
- Node.js, Express, Socket.io, CORS, dotenv, and Helmet
- JavaScript ES modules and plain CSS

### Architecture

```text
React
  ⇅
Socket.io
  ⇅
Node HTTP Server
├── Express
└── Socket.io
```

Express and Socket.io share the same HTTP server. The HTTP surface currently contains only `GET /health`; Helmet protects HTTP response headers but is not WebSocket authentication.

### Connection Lifecycle

The client configures one socket singleton with `autoConnect: false`. Identity is assigned before manual connection. React subscribes with stable handler references and removes every listener during cleanup. Socket.io reconnects with the same identity, the server validates it again, restores server-selected rooms, and updates presence.

### Temporary Identity

**THIS IS NOT AUTHENTICATION.** `userId` and `displayName` are supplied through handshake auth and can be spoofed. Middleware only validates and normalizes them. Secure identity would require a verified JWT or server session.

### Room Design

- `all-users` contains every validated socket.
- `user:<userId>` contains every socket using that temporary user ID.

Clients cannot request arbitrary joins. Multiple sockets may share one logical user room.

### Events

| Direction | Event | Payload/result |
|---|---|---|
| Client → server | `client:ping` | No required payload |
| Server → socket | `server:pong` | `{ message, timestamp }` |
| Client → server | `client:broadcast` | `{ message }`, acknowledgement |
| Server → all users | `server:broadcast` | `{ from, message, timestamp }` |
| Client → server | `client:user-message` | `{ targetUserId, message }`, acknowledgement |
| Server → user room | `server:user-message` | `{ from, message, timestamp }` |
| Client → server | `client:send-notification` | `{ targetUserId, type, title, message }`, acknowledgement |
| Server → user room | `server:notification` | `{ id, type, title, message, recipientUserId, createdAt, read }` |
| Server → connected clients | `server:presence` | `{ users: [{ userId, displayName }], timestamp }` |

### Global Broadcast

Validated broadcasts are emitted to `all-users`; the sender receives their own event intentionally. General event history is browser-memory-only and capped at 20 entries.

### User-Specific Delivery

User messages target only `user:<validatedTargetUserId>`. Because identity is spoofable, this demonstrates routing architecture and is not secure private messaging.

### Notification Center

The server generates notification UUIDs and emits only to the recipient room. The browser tracks unread state, supports marking one/all read and clearing, and caps history at the newest 50. Read state is never sent to the server.

### Presence

The server maintains `userId → Set<socketId>` plus the normalized display name. A first socket makes a logical user online; extra sockets do not duplicate the user or trigger redundant global presence updates. The user goes offline only after their final socket disconnects. New sockets receive a current snapshot.

### Acknowledgements

Business-event success uses `{ ok: true, ... }`; validation failure uses `{ ok: false, error: "Safe message" }`. Ping and server-pushed presence do not require acknowledgements.

### Reconnection Behavior

Rooms and presence are rebuilt from the validated handshake. Listeners remain single. No event history is persisted, so broadcasts, messages, and notifications missed while disconnected are not replayed; only new events arrive.

### Performance Decisions

- No polling or repeated intervals
- One intentional client socket
- Stable listener registration and cleanup
- Event history capped at 20; notifications capped at 50
- Presence updates only for logical-list changes, plus direct snapshots to additional sockets
- Presence entries removed after the final socket disconnects
- Server-controlled rooms and recipient-room delivery
- No server-side message or notification history

### Limitations

- Temporary identity is spoofable
- No authentication or secure private messaging
- No database, Redis, or persistence
- No offline replay
- No full chat application

### Environment Setup

Copy both `.env.example` files to ignored `.env` files. The server uses `PORT` and exact `CLIENT_ORIGIN`; the client uses `VITE_SOCKET_URL`. No wildcard origin is configured.

### Running Client

```bash
cd client
npm install
npm run dev
```

### Running Server

```bash
cd server
npm install
npm run dev
```

### Production Build

```bash
cd client
npm run build
```

Start the server without file watching with `npm start`.

### What I Learned

This task demonstrates sharing HTTP and WebSocket infrastructure, validating handshakes, using rooms without client-controlled membership, designing acknowledgement contracts, handling multi-socket logical presence, bounding browser memory, and preventing listener leaks across React and Socket.io lifecycles.
