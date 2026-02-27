# Aasia Clad Pro

Vite + React app for project, PO, line item, spool, and NMR workflows.

## Local Setup

1. Install dependencies:
   `npm install`
2. Create `.env` from `.env.example` and set:
   `VITE_SUPABASE_URL`
   `VITE_SUPABASE_ANON_KEY`
3. Run:
   `npm run dev`

## Supabase Setup

1. Create a Supabase project.
2. In Supabase SQL editor, run [`supabase/schema.sql`](supabase/schema.sql).
3. Copy project URL and anon key into `.env` (and later into Vercel env vars).

The app syncs all Zustand data to one row in `public.app_state` (`id = "global"`).

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import project in Vercel.
3. Set Environment Variables in Vercel:
   `VITE_SUPABASE_URL`
   `VITE_SUPABASE_ANON_KEY`
4. Deploy.

`vercel.json` includes SPA rewrite so all routes resolve to `index.html`.
