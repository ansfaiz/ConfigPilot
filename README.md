<div align="center">

# ⚙️ ConfigPilot

### Build full-stack data modules from a JSON config — no boilerplate required.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-config--pilot--one.vercel.app-6366f1?style=for-the-badge&logo=vercel&logoColor=white)](https://config-pilot-one.vercel.app/)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express_v5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=pink)](https://jwt.io/)

</div>

---

## 🌐 Live Demo

| Environment | URL |
|---|---|
| **Frontend** | [https://config-pilot-one.vercel.app/](https://config-pilot-one.vercel.app/) |
| **API Health** | `/api/health` — returns `{ "status": "ok" }` |

> Create a free account and start building your first data module in under 60 seconds.

---

## 📸 Screenshots

> _Add screenshots here by replacing the placeholders below._

| Dashboard | Dynamic Form | Records Table |
|:-:|:-:|:-:|
| ![Dashboard](./screenshots/dashboard.png) | ![Form](./screenshots/form.png) | ![Table](./screenshots/table.png) |

---

## ✨ Features

### 🔐 Authentication
- User registration with hashed passwords (`bcryptjs`)
- JWT-based login with persistent sessions
- Protected routes on both client (React guards) and server (middleware)
- `/api/auth/me` endpoint to rehydrate user session on reload

### 🧩 Dynamic Module System
- Define any data module using a **JSON config** — name the fields, set types, done
- The engine reads the config and instantly renders a **fully functional form** and a **searchable records table**
- No repeated component code. One engine, unlimited modules

### 📋 CRUD Operations
- Create, read, update, and delete records — all scoped per-user
- Records stored in PostgreSQL as `JSONB`, so any config shape is supported
- Module filtering: fetch records for a specific module via query param

### 🛡️ Production-Grade Backend
- `helmet` for security headers
- `express-rate-limit` on auth routes (40 req / 15 min window)
- CORS whitelist driven by environment variable — no wildcard origins in production
- `x-powered-by` header disabled
- Central error handler with safe, non-leaking error messages

### 🎨 UI / UX
- Responsive, modern UI built with Tailwind CSS v4
- Toast notifications via `react-hot-toast`
- Clean loading states and error feedback
- Works on desktop and mobile

---

## 🏗️ How It Works

```
User defines a JSON config
        │
        ▼
Config is passed to DynamicForm  ──→  User fills in the form
        │
        ▼
POST /api/records  ──→  Express validates  ──→  Stored as JSONB in PostgreSQL
        │
        ▼
GET /api/records?module=<name>  ──→  DynamicTable renders records from config schema
```

1. **Config** — A JSON object defines field names, labels, and input types for a module.
2. **DynamicForm** — Iterates the config fields and renders the correct HTML input for each one.
3. **DynamicTable** — Reads the same config to produce column headers and maps record data to rows.
4. **API** — A single generic `/api/records` endpoint handles all modules; the `module` name acts as a namespace.
5. **Auth** — Every API call to `/api/records` requires a valid JWT — enforced by middleware before any controller runs.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 8, Tailwind CSS v4 |
| **Routing** | React Router v7 |
| **HTTP Client** | Axios |
| **Notifications** | react-hot-toast |
| **Backend** | Node.js, Express v5 |
| **Database** | PostgreSQL (via `pg`), Supabase (hosted) |
| **Auth** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` |
| **Security** | Helmet, express-rate-limit, CORS whitelist |
| **Deployment** | Vercel (frontend), Render (backend) |

---

## 🚀 Local Installation

### Prerequisites

- Node.js ≥ 18
- A PostgreSQL database (local or [Supabase](https://supabase.com) free tier)

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/ConfigPilot.git
cd ConfigPilot
```

### 2. Set up the server

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:

```env
PORT=5000
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your_super_secret_jwt_key
CORS_ORIGINS=http://localhost:5173
```

Start the server:

```bash
npm run dev
```

The server auto-creates the `users` and `records` tables on first boot.

### 3. Set up the client

```bash
cd ../client
npm install
```

Create a `.env` file in the `client/` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the client:

```bash
npm run dev
```

The app will be available at **http://localhost:5173**.

---

## 🔑 Environment Variables

### Server (`server/.env`)

| Variable | Description | Required |
|---|---|---|
| `PORT` | Port for the Express server | No (default: `5000`) |
| `DATABASE_URL` | PostgreSQL connection string | ✅ Yes |
| `JWT_SECRET` | Secret key for signing JWTs | ✅ Yes |
| `CORS_ORIGINS` | Comma-separated list of allowed origins | ✅ Yes (production) |

### Client (`client/.env`)

| Variable | Description | Required |
|---|---|---|
| `VITE_API_URL` | Base URL of the backend API | ✅ Yes |

> ⚠️ Only variables prefixed with `VITE_` are exposed to the browser bundle. Never put secrets in the client `.env`.

---

## 📡 API Overview

All `/api/records` routes require a valid `Authorization: Bearer <token>` header.

### Auth

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | ❌ |
| `POST` | `/api/auth/login` | Login, receive JWT | ❌ |
| `GET` | `/api/auth/me` | Get current user from token | ✅ |

### Records

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/records` | List all records (optionally filter by `?module=`) | ✅ |
| `POST` | `/api/records` | Create a new record | ✅ |
| `PUT` | `/api/records/:id` | Update a record by ID | ✅ |
| `DELETE` | `/api/records/:id` | Delete a record by ID | ✅ |

### Health

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Returns `{ "status": "ok" }` — no auth needed |

**Example — Create a record:**

```http
POST /api/records
Authorization: Bearer <token>
Content-Type: application/json

{
  "module": "contacts",
  "data": {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "555-0100"
  }
}
```

---

## 📁 Folder Structure

```
ConfigPilot/
├── client/                     # React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DynamicForm.jsx     # Renders a form from a field config
│   │   │   └── DynamicTable.jsx    # Renders a table from a field config
│   │   ├── pages/
│   │   │   ├── Home.jsx            # Landing / marketing page
│   │   │   ├── Login.jsx           # Login page
│   │   │   ├── Register.jsx        # Registration page
│   │   │   └── Dashboard.jsx       # Main app — module builder & records view
│   │   ├── AuthContext.jsx         # React context for auth state
│   │   ├── RouteGuards.jsx         # Protected & public route wrappers
│   │   ├── api.js                  # Axios instance with base URL + auth header
│   │   └── App.jsx                 # Router setup
│   ├── .env.example
│   └── vite.config.js
│
└── server/                     # Node.js + Express backend
    ├── config/
    │   └── db.js                   # PostgreSQL pool (pg)
    ├── controllers/
    │   ├── authController.js       # register / login / me handlers
    │   └── dataController.js       # CRUD handlers for records
    ├── middleware/
    │   └── authMiddleware.js       # JWT verification middleware
    ├── routes/
    │   ├── authRoutes.js           # /api/auth/*
    │   └── dataRoutes.js           # /api/records/*
    └── server.js                   # App bootstrap, table init, rate limiting
```

---

## 💡 Why This Project Matters

Most tutorials show how to build a single hard-coded CRUD app. ConfigPilot demonstrates something more practical: **driving UI structure from data, not code**.

This pattern — sometimes called "schema-driven UI" or "low-code engine" — is core to how real internal tools, admin panels, and B2B SaaS products are built at scale. Instead of writing a new form and table for every entity, the config becomes the single source of truth.

The project covers the full lifecycle: auth, API design, database modeling, dynamic rendering, deployment, and security hardening — all integrated into a coherent product.

---

## 🧗 Challenges Solved

| Challenge | Approach |
|---|---|
| **Generic CRUD for arbitrary schemas** | Stored record payload as PostgreSQL `JSONB` — no schema migration needed per module |
| **Dynamic form rendering** | `DynamicForm` iterates a field-config array; input type is determined by the `type` key |
| **Secure CORS in production** | Origins loaded from a comma-separated env variable; dev defaults kept separate |
| **Session persistence on reload** | `/api/auth/me` re-validates the stored token and rehydrates the React auth context |
| **Preventing auth brute-force** | `express-rate-limit` applied only to `/api/auth` — keeps API routes unthrottled |
| **Safe error handling** | Central Express error handler masks 5xx messages from the client |

---

## 🔮 Future Improvements

- [ ] **Field validation rules in config** — e.g., `required`, `minLength`, regex patterns defined in JSON
- [ ] **Multiple config presets** — save, name, and switch between module configs
- [ ] **Export to CSV / JSON** — allow users to download their records
- [ ] **Role-based access control** — admin vs. standard user permissions per module
- [ ] **Real-time updates** — WebSocket or SSE for live record sync across sessions
- [ ] **Config import / sharing** — paste or import a JSON config from another user
- [ ] **Pagination** — server-side pagination for large record sets
- [ ] **Unit & integration tests** — Jest + Supertest for API, React Testing Library for UI

---

## 👤 Author

**Your Name**
Full-Stack Developer

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/your-username)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white)](https://linkedin.com/in/your-profile)
[![Portfolio](https://img.shields.io/badge/Portfolio-000000?style=flat-square&logo=vercel&logoColor=white)](https://your-portfolio.dev)

---

## 📄 License

This project is open source under the [MIT License](./LICENSE).

---

<div align="center">

Built with focus and shipped to production. ⚙️

</div>
