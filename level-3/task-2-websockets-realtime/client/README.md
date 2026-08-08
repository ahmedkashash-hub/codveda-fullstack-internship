# Client

React/Vite diagnostics dashboard using one manually connected `socket.io-client` singleton.

## Setup

Set `VITE_SOCKET_URL` in an ignored `.env` file, then run:

```bash
npm install
npm run dev
```

Build with `npm run build` and inspect with `npm run preview`.

## Lifecycle and state

Temporary identity is assigned to `socket.auth` before connection. Hooks subscribe to lifecycle, ping, broadcast, user-message, notification, and presence events and remove the exact same handlers during cleanup. Presence is cleared locally on disconnect and restored from the next server snapshot.

The dashboard includes connection controls, ping/pong, broadcasts, user-specific messages, a notification demo and center, and semantic online presence. General received-event lists retain 20 entries; notification history retains 50. Notification read state exists only in browser memory.

There is no polling, persistence, offline replay, or secure authentication. Temporary identity is spoofable.
