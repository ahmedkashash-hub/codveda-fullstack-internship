# Client

React application powered by Vite and written in JavaScript. React Router provides public and protected routes, while one Axios client uses the environment-configured Express API base URL.

## Environment

Copy `.env.example` to `.env` and configure `VITE_API_BASE_URL`. The provided development example targets `http://localhost:3000/api`.

## Authentication

Registration creates an account and then sends the user to sign in. Login stores only the access token under `codveda_access_token` in `localStorage`; passwords and redundant user objects are never persisted. This localStorage choice is suitable for this training implementation but is not presented as the strongest production token-storage strategy.

On startup, the authentication context reads the token and asks the backend `/auth/me` endpoint for the current user. Invalid or expired tokens are removed. `/dashboard` is protected and redirects unauthenticated visitors to `/login` while preserving their intended destination.

## Task dashboard

The protected dashboard connects to the authenticated task API through `taskService` and the `useTasks` hook. It supports creating, editing, deleting, searching, status and priority filters, allowlisted sorting, and server-driven pagination. Loading, retryable error, empty, and no-match states are included.

The shared Axios request interceptor reads `codveda_access_token` immediately before each request and adds a Bearer header only when a token exists. It contains no navigation or refresh-token logic. A task API 401 clears authentication through the existing context, allowing the protected route to return the user to login.

Task forms convert `datetime-local` values to ISO strings. Clearing an existing due date sends `null`. Ownership fields are never included in client task payloads; the backend remains responsible for identity and ownership.

Task-list requests are canceled when query controls change or the dashboard unmounts, preventing stale responses from replacing newer results. Search is submit-based, and mutations perform only the refresh needed to reconcile the current page.

## Commands

```bash
npm install
npm run dev
```

Create a production build with:

```bash
npm run build
```
