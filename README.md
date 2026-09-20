# Corporate Giving Hub

A full-stack competition-management platform for an AAPLE Corporate Giving
student committee. Teams compete to contact businesses, book meetings, give
pitches, and raise money — all tracked with a live leaderboard, analytics,
and a fully editable admin control panel.

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4**
- **Prisma + SQLite** for a real, persistent relational database
- Custom **JWT-based admin authentication** (`jose` + `bcryptjs`), enforced
  server-side on every mutating API route — not just hidden in the UI
- **Recharts** for analytics visualizations

## Getting Started

```bash
npm install
npx prisma migrate deploy   # create the SQLite database
npm run db:seed             # seed default settings + demo data
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- **Admin panel:** `/admin` — default password is `AAPLE2026` (change it
  from Admin → Data Management once you're in).
- The `.env` file configures `DATABASE_URL` (SQLite file) and
  `ADMIN_SESSION_SECRET` (used to sign admin session cookies — change this
  for a real deployment).

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
