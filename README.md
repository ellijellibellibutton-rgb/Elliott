# Corporate Giving Hub

A full-stack competition-management platform for an AAPLE Corporate Giving
student committee. Teams compete to contact businesses, book meetings, give
pitches, and raise money — all tracked with a live leaderboard, analytics,
and a fully editable admin control panel.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/import?s=https://github.com/ellijellibellibutton-rgb/Elliott/tree/claude/exciting-knuth-iph3l6)

Clicking that imports this exact branch into a new Vercel project. You'll
still need to add a Postgres database and one env var (see
[Deploying to Vercel](#deploying-to-vercel)) — the app auto-detects
whatever connection-string variable names Vercel's own Postgres
integration (or Neon/Supabase) injects, so there's no copying database
secrets around by hand.

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4**
- **Prisma + PostgreSQL** for a real, persistent relational database
- Custom **JWT-based admin authentication** (`jose` + `bcryptjs`), enforced
  server-side on every mutating API route — not just hidden in the UI
- **Recharts** for analytics visualizations

## Getting Started (local development)

You need a Postgres database. The quickest option is a free one from
[Neon](https://neon.tech) or [Supabase](https://supabase.com); or run
Postgres locally / via Docker.

```bash
npm install
cp .env.example .env         # fill in DATABASE_URL / DIRECT_URL / ADMIN_SESSION_SECRET
npx prisma migrate deploy    # create the schema
npm run db:seed              # seed default settings + demo data
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- **Admin panel:** `/admin` — default password is `AAPLE2026` (change it
  from Admin → Data Management once you're in).
- `DATABASE_URL` is the pooled connection string the app uses at runtime;
  `DIRECT_URL` is the direct/unpooled one Prisma uses to run migrations.
  For a simple single Postgres instance (e.g. local dev) they can be the
  same value. `ADMIN_SESSION_SECRET` signs the admin session cookie —
  always set a long random value for a real deployment.

## Deploying to Vercel

This app is set up so `npm run build` runs `prisma migrate deploy`
automatically before `next build`, so a plain Vercel deploy keeps the
database schema in sync on every push — no manual migration step. It also
auto-detects whichever Postgres connection-string variable names your
provider injected (Vercel Postgres/Neon typically use `POSTGRES_URL` /
`POSTGRES_PRISMA_URL` / `POSTGRES_URL_NON_POOLING`, not `DATABASE_URL` /
`DIRECT_URL` directly), so **you generally don't need to create or copy
any database env vars by hand** — see `lib/dbUrl.ts` / `scripts/resolve-db-url.cjs`
if you want to see exactly how.

1. Push this repo to GitHub (already done if you're reading this from the
   repo) and import it in the [Vercel dashboard](https://vercel.com/new).
   Vercel auto-detects the Next.js project; no config changes needed.
2. Add a Postgres database from the **Storage** tab of your Vercel project
   (Vercel offers Neon-backed Postgres directly) — or create one yourself
   on [Neon](https://neon.tech)/[Supabase](https://supabase.com) and link
   it manually. Once connected, its connection strings are already in your
   project's environment variables — nothing more to do here.
3. In **Project Settings → Environment Variables**, add just one:
   - `ADMIN_SESSION_SECRET` — any long random string you make up yourself.
   (Only add `DATABASE_URL` / `DIRECT_URL` manually if your provider didn't
   auto-inject any of the recognized names above — check `lib/dbUrl.ts`
   for the full fallback list.)
4. Deploy.
5. Once it's live, populate the database by visiting, in your browser:
   `https://<your-vercel-url>/api/setup?key=<your ADMIN_SESSION_SECRET>`
   (the same value from step 3 — no separate secret to manage). This
   creates the admin account and default demo data; it's safe to load more
   than once, it only fills in what's missing.
6. Go to `/admin`, log in with `AAPLE2026`, and change the password
   immediately — Data Management → Change Admin Password.

## What's editable

Everything: campaign settings, teams & rosters, the scoring formula
(including the $-per-100 dollar conversion rate), activity logging, sprints,
judges, rules, prizes, awards, Win of the Week, and meeting agendas — all
through `/admin`, all persisted to the database, and all reflected
immediately on the public leaderboard/analytics pages (which poll for
updates every 15–20s).

Records seeded by `npm run db:seed` are flagged `isDemo: true` so they can
be bulk-cleared from Admin → Data Management → "Clear demo data" without
touching anything an admin has since created.

## Project structure

- `prisma/schema.prisma` — full relational schema
- `prisma/seed.ts` — default scoring rules, sprints, demo teams/activities
- `lib/scoring.ts`, `lib/leaderboard.ts`, `lib/analytics.ts` — all points
  and standings are computed live from current scoring settings, so an
  admin changing a point value retroactively recalculates the whole board
- `lib/auth.ts`, `lib/guard.ts` — session auth + server-side route guards
- `app/api/**` — REST-ish route handlers (public GETs, admin-gated writes)
- `app/**/page.tsx` — Leaderboard/Dashboard (`/`), Analytics, Judges &
  Rules, Prizes & Awards, and the Admin control panel
- `components/admin/**` — the admin CRUD UI for every section
