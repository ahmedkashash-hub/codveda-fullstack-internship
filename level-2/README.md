# Level 2 — Full-Stack Application Foundations

Level 2 advances the internship work from isolated fundamentals to three
portfolio-quality projects focused on frontend architecture, application
security, and relational data persistence.

## Objectives

- Build a maintainable React application with Vite.
- Implement secure JWT-based authentication and role-based authorization.
- Design and integrate a PostgreSQL database through Prisma ORM.
- Apply consistent error handling, validation, configuration, and documentation.
- Keep every task independently installable, runnable, and reviewable.

## Tasks

| Task | Project | Primary focus | Status |
| --- | --- | --- | --- |
| 1 | React Frontend | Component architecture, routing, API access, and UI state | Not started |
| 2 | Authentication & Authorization | Identity, JWT, password security, and access control | Not started |
| 3 | Database Integration | Relational modeling, migrations, seeding, and Prisma | Not started |

## Planned Structure

```text
level-2/
├── task-1-react-frontend/
├── task-2-authentication-authorization/
├── task-3-database-integration/
└── README.md
```

Each task will contain its own README with setup instructions, architectural
decisions, environment requirements, testing guidance, and screenshots where
applicable.

## Technology Standards

- Node.js with ES modules
- Express
- React with Vite and functional components
- React Router
- Axios
- PostgreSQL
- Prisma ORM
- JSON Web Tokens
- bcrypt
- Environment-based configuration

## Engineering Standards

- Keep controllers, business logic, persistence, and transport concerns separate.
- Validate all untrusted input at the application boundary.
- Centralize error handling and configuration.
- Never commit credentials or environment-specific secrets.
- Use migrations for reproducible database changes.
- Prefer small, focused modules with explicit responsibilities.
- Document setup and verification steps alongside each task.

## Development Sequence

1. Build and verify the React frontend foundation.
2. Build the authentication and authorization API independently.
3. Add PostgreSQL persistence with Prisma migrations and seed data.
4. Review documentation, screenshots, security, and repository consistency.

## Progress

- [ ] Task 1 — React Frontend
- [ ] Task 2 — Authentication & Authorization
- [ ] Task 3 — Database Integration

