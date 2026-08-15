
# Kalendo

A calendar and notes app built with React, TypeScript, Supabase, and
Tailwind CSS. Users sign up with email/password, manage a month-view
calendar with color-coded categories, and keep freeform notes separate
from the calendar.

**Live:** [Kalendo](https://kalendo-deploy.vercel.app/)

## Features

- **Authentication** — email/password sign-up, login, and logout via
  Supabase Auth, including handling for email confirmation and
  already-registered accounts.
- **Calendar** — month view with navigation between months, create and
  delete events, each assigned a category and color.
- **Categories** — events are grouped into **Work**, **Personal**, and
  **School**, enforced at the database level via a check constraint.
- **Notes** — a separate section for freeform notes, independent of the
  calendar and events.
- **Security** — Row Level Security on every table, so each user can
  only ever read or modify their own data.

## Tech stack

- [React](https://react.dev/) 18 + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) for the dev server and build
- [Supabase](https://supabase.com/) (Postgres, Auth, Row Level Security)
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide](https://lucide.dev/) icons
- Hosted on [Vercel](https://vercel.com/)

## How it works

`App.tsx` checks whether Supabase env vars are configured and shows a
setup warning if not; otherwise it renders the auth-gated app. Auth
state (login, registration, logout, session) is handled centrally in
`context/AuthContext.tsx` via Supabase Auth and exposed through the
`useAuth` hook. Once signed in, users switch between the calendar and
notes views from the navbar. `Calendar.tsx` and `Notes.tsx` each read
and write directly to Supabase, scoped to the current user by RLS —
there's no separate backend API.

## Database

The schema — `events` and `notes` tables, indexes, RLS policies, and an
`updated_at` trigger — lives in `supabase_setup.sql`. It's idempotent,
so re-running it in the Supabase SQL Editor is safe even after schema
changes (e.g. it migrates old category values to the current
`Work`/`Personal`/`School` set).

Row Level Security is enabled on both tables; every policy checks
`user_id = auth.uid()`, so a user can never see or modify another
user's rows, even through direct API calls.

## Deployment

Deployed on Vercel, connected to this repo's `main` branch — every push
triggers a new deployment automatically. Required environment
variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) are set in
the Vercel project settings, using the Supabase project's URL and
**anon public** key (never the `service_role` key).

## Project structure

```
├── src/
│   ├── main.tsx                  React bootstrap
│   ├── App.tsx                   Auth check, navbar, view routing
│   ├── lib/supabase.ts           Supabase client
│   ├── context/AuthContext.tsx   Login, registration, logout
│   ├── types/                    Event & note types
│   └── components/
│       ├── Auth.tsx              Login/register form
│       ├── Calendar.tsx          Month view with navigation
│       ├── EventModal.tsx        Create/delete events
│       └── Notes.tsx             Create/delete notes
├── supabase_setup.sql            Schema, RLS policies, triggers
└── eslint.config.js              Lint rules
```

## License

MIT — see [LICENSE](./LICENSE).
