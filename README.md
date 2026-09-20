# Corporate Giving Hub

A full-stack competition-management platform for an AAPLE Corporate Giving
student committee. Teams compete to contact businesses, book meetings, give
pitches, and raise money — all tracked with a live leaderboard, analytics,
and a fully editable admin control panel.

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
database schema in sync on every push — no manual migration step.

1. Push this repo to GitHub (already done if you're reading this from the
   repo) and import it in the [Vercel dashboard](https://vercel.com/new).
   Vercel auto-detects the Next.js project; no config changes needed.
2. Add a Postgres database from the **Storage** tab of your Vercel project
   (Vercel offers Neon-backed Postgres directly) — or create one yourself
   on [Neon](https://neon.tech)/[Supabase](https://supabase.com) and link
   it manually. Either way this gives you a connection string.
3. In **Project Settings → Environment Variables**, set:
   - `DATABASE_URL` — the **pooled** connection string (Neon/Vercel
     Postgres provide one automatically, usually with `-pooler` in the
     hostname, or a `?pgbouncer=true` flag).
   - `DIRECT_URL` — the **direct/unpooled** connection string (used only
     for running migrations during build).
   - `ADMIN_SESSION_SECRET` — a long random string.
4. Deploy. After the first deploy, run the seed once against production so
   the app isn't empty:
   ```bash
   DATABASE_URL="<your prod DATABASE_URL>" npm run db:seed
   ```
5. Visit your Vercel URL, then go to `/admin` and change the default
   password (`AAPLE2026`) immediately — Data Management → Change Admin
   Password.

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
