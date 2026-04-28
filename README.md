# ConfigPilot

ConfigPilot is a mini low-code platform that transforms JSON configs into working full-stack app modules.
You define a module schema once, and ConfigPilot renders dynamic forms, records tables, and CRUD flows with authentication.

## What it does

- Premium landing page with product-focused branding
- User authentication (register, login, protected dashboard)
- JSON config editor with validation
- Dynamic form generation from config
- Dynamic table generation from config
- Module templates (Contacts, Tasks, Products, Leads)
- Record management with PostgreSQL-backed CRUD APIs

## Tech stack

- **Frontend:** React, React Router, Tailwind CSS (with custom dark SaaS theme), Axios, Vite
- **Backend:** Node.js, Express, PostgreSQL, JWT, bcryptjs
- **Dev tooling:** Nodemon, ESLint

## Project structure

```text
ConfigPilot/
  client/   # React + Vite frontend
  server/   # Express + PostgreSQL backend
```

## Prerequisites

- Node.js 18+ recommended
- npm
- PostgreSQL running locally or remotely

## Environment variables

Create `server/.env`:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/configpilot
JWT_SECRET=replace_with_a_long_random_secret
PORT=5000
```

## Installation

Install dependencies for both apps:

```bash
cd client && npm install
cd ../server && npm install
```

## Run locally

Start backend:

```bash
cd server
npm run dev
```

Start frontend (new terminal):

```bash
cd client
npm run dev
```

Frontend runs on `http://localhost:5173` and proxies `/api` to backend `http://localhost:5000`.

## Available scripts

### Client

- `npm run dev` - start Vite dev server
- `npm run build` - production build
- `npm run preview` - preview built app
- `npm run lint` - run ESLint

### Server

- `npm run dev` - start API with Nodemon
- `npm start` - start API with Node

## API overview

Base path: `/api`

### Auth routes

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me` (protected)

### Record routes (protected)

- `GET /records?module=<name>`
- `POST /records`
- `PUT /records/:id`
- `DELETE /records/:id`

## Default flow

1. Open `/` landing page
2. Create account or login
3. Access dashboard
4. Edit/apply JSON config
5. Submit records via dynamic form
6. View/search/delete in dynamic table

## Notes

- Backend auto-creates `users` and `records` tables on startup.
- User data is scoped by authenticated user id.
- Existing dashboard behavior is preserved while UI/theme was upgraded.
