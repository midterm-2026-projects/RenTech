# RenTech — Project Guide

This guide explains the overall structure of the project, what every folder
does, and — most importantly — **how database migrations work** and **how to add
a new table using only files** (no Supabase dashboard required).

---

## 1. Project at a glance

RenTech is split into two parts:

| Folder      | What it is                                            |
|-------------|-------------------------------------------------------|
| `backend/`  | Node.js + Express API server (talks to a Supabase Postgres database) |
| `frontend/` | React (Vite) single-page application that calls the backend API |

The backend stores data in **Supabase Postgres**. Schema changes (creating or
altering tables) are managed through **SQL migration files** that live in
`backend/migrations/`.

---

## 2. Backend structure

```
backend/
├── App.js                  # Express app entry point; defines routes & starts server
├── package.json            # Dependencies and scripts (start, dev, migrate, test)
├── .env                    # Secrets: SUPABASE_URL, SUPABASE_PAT, SUPABASE_ANON_KEY
├── vitest.config.js        # Test runner config
├── config/                 # Connections & shared setup
├── controller/             # HTTP request handlers (call services, shape responses)
├── route/                  # Route definitions (URL -> controller/function)
├── service/                # Business logic
├── model/                  # Data access (talks to the database)
├── middleware/             # Express middlewares (validation, auth, etc.)
├── data/                   # Static/mock data used in dev
├── migrations/             # SQL migration files + the migration runner
└── test/                   # Unit and integration tests
```

### Folder meaning

| Folder        | Responsibility |
|----------------|---------------|
| `config/`      | Database connection (`database.js`) and Supabase client (`supabaseClient.js`). Holds the `query()` helper used by migrations. |
| `controller/`  | Receives HTTP requests, validates input, calls a service, and returns a response. |
| `route/`       | Maps HTTP paths (e.g. `/api/forecasts`) to controllers/services. |
| `service/`     | Contains business rules and orchestration. Controllers defer real work here. |
| `model/`       | Low-level data access. Reads/writes the database and runs migrations. |
| `middleware/`  | Cross-cutting HTTP logic (request validation, auth guards, error handling). |
| `data/`        | Mock/local data used when a live database is not configured. |
| `migrations/`  | **SQL files that change the database schema + the runner that applies them.** |
| `test/`        | `unit/` and `integration/` tests run with Vitest. |

### How a request flows

```
HTTP request
   -> route/        (which path?)
   -> controller/   (validate + call service)
   -> service/      (business logic)
   -> model/        (read/write database via config/database.js)
   <- response back up the chain
```

---

## 3. Frontend structure

```
frontend/
├── index.html              # HTML shell
├── vite.config.js          # Vite dev server / build config
├── package.json            # Frontend dependencies & scripts
├── public/                 # Static assets served as-is
└── src/
    ├── main.jsx            # React entry point
    ├── App.jsx             # Root component & router
    ├── index.css           # Global styles
    ├── components/         # Reusable UI pieces (forms, cards, dashboards, chat, etc.)
    ├── pages/              # Page layouts (AdminLayout, CustomerLayout, NotAuthorized)
    ├── services/           # API clients that call the backend
    └── test/               # Component + integration tests (Vitest + React Testing Library)
```

### Folder meaning

| Folder            | Responsibility |
|-------------------|---------------|
| `src/components/` | Individual UI building blocks (Login, Catalog, KPICards, ChatBox, …). |
| `src/pages/`      | Full page layouts that compose components and enforce routing/auth. |
| `src/services/`   | Functions that call backend API endpoints (e.g. `aiInsightsService.js`). |
| `src/test/`       | Frontend tests, split into `component/` and `integration/`. |

The frontend never talks to the database directly — it only calls the backend's
REST API.

---

## 4. How migrations work

A **migration** is just a `.sql` file that changes the database schema (usually
`CREATE TABLE`). RenTech applies migrations **from files**, so you never have to
open the Supabase dashboard.

### The pieces

| File | Role |
|------|------|
| `migrations/001_analytics_schema.sql` | SQL that creates the analytics tables. |
| `migrations/runner.js`                | Reads every `*.sql` file (in alphabetical order) and runs the ones not yet applied. |
| `migrations/cli.js`                   | Command-line entry point so you can run migrations with `npm run migrate`. |
| `migrations/_migrations` (table)     | A tracking table auto-created in the database that records which files were applied. |
| `model/analytics.model.js` → `runMigration()` | Calls the runner; also exposed via `POST /api/migrations/run`. |
| `config/database.js` → `query()`      | Sends the SQL to Supabase through the **Management API** using `SUPABASE_PAT`. |

### Step by step

1. **Bootstrap:** On every run, the runner ensures a `_migrations` table exists
   (`CREATE TABLE IF NOT EXISTS _migrations`). This table stores the filename of
   each applied migration and when it ran.
2. **Discover:** It lists all `*.sql` files in `migrations/`, sorted by name
   (`001_...`, `002_...`, …).
3. **Filter:** It asks the database which files are already recorded in
   `_migrations`, and skips those.
4. **Apply:** For each new file it runs the SQL, then inserts a row into
   `_migrations` recording the filename.
5. **Result:** It returns which files were `ran` vs `skipped`.

Because filenames are tracked, re-running migrations is **safe and idempotent** —
already-applied files are never run twice.

> **Why the Management API?** The Supabase JS client cannot execute DDL
> (`CREATE TABLE`). So `query()` sends SQL to
> `https://api.supabase.com/v1/projects/{ref}/database/query` using a personal
> access token (`SUPABASE_PAT`).

### How to run migrations

From the `backend/` folder, with `SUPABASE_URL` and `SUPABASE_PAT` set in `.env`:

```bash
cd backend
npm run migrate
```

Or, if the server is running, call the endpoint:

```bash
curl -X POST http://localhost:5000/api/migrations/run
```

---

## 5. How to create a new table (file-only workflow)

You only ever touch files — no Supabase dashboard needed.

### Step 1 — Create a migration file

Add a new, **numerically prefixed** `.sql` file in `backend/migrations/`. The
prefix controls order (always keep them sequential: `002_`, `003_`, …).

Example `backend/migrations/002_customer_feedback.sql`:

```sql
CREATE TABLE IF NOT EXISTS customer_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  rating INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

> Tip: Always use `CREATE TABLE IF NOT EXISTS` so the file is safe to re-run.

### Step 2 — Run the migration

```bash
cd backend
npm run migrate
```

The runner will:
- see `002_customer_feedback.sql` is not yet in `_migrations`,
- execute the `CREATE TABLE`,
- record the file in `_migrations`.

### Step 3 — Use the table in code

Add a model function that reads/writes it. For example, in a new
`model/feedback.model.js`:

```js
import { getSupabase } from '../config/supabaseClient.js';

export async function addFeedback(row) {
  const sb = getSupabase();
  return sb.from('customer_feedback').insert(row).select();
}
```

Then wire it through a `service/`, `controller/`, and `route/` as the rest of
the app does.

### Step 4 — (optional) Add a test

Add a unit test under `test/unit/` that mocks `config/database.js`, following
the pattern in `test/unit/migrationRunner.test.js`.

---

## 6. Quick reference

| Goal | Do this |
|------|---------|
| Add a table | Create `migrations/00N_name.sql` with `CREATE TABLE IF NOT EXISTS`, then `npm run migrate`. |
| Apply pending migrations | `cd backend && npm run migrate` (or `POST /api/migrations/run`). |
| See what ran | Check the `_migrations` table in Supabase. |
| Change an existing table | Add a **new** migration file (`00N_...`) with `ALTER TABLE …`; never edit an already-applied file. |
| Run backend tests | `cd backend && npm test`. |
| Run frontend tests | `cd frontend && npm test`. |

### Best practices

- **Never edit an already-applied migration file.** If a table needs a change,
  write a new numbered migration with `ALTER TABLE`.
- Keep filenames ordered with a numeric prefix so they always run in the same
  sequence.
- Use `IF NOT EXISTS` / `IF NOT` guards so re-running is harmless.
