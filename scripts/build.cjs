// Build orchestrator for Vercel (and any other host running `npm run build`).
//
// Vercel's own Postgres integration (and most marketplace providers) inject
// connection strings under provider-specific names like POSTGRES_PRISMA_URL
// / POSTGRES_URL_NON_POOLING rather than the DATABASE_URL / DIRECT_URL this
// app's Prisma schema names. We resolve those here and pass them directly
// to each child process's environment — NOT via a .env file — because
// dotenv-style loaders (which the Prisma CLI uses) refuse to override a
// variable that already exists in process.env, even if it's set to an
// empty string. That "already exists but empty" case is exactly what
// happens if DIRECT_URL was ever manually added in the Vercel dashboard
// with no value: writing to .env silently has no effect, and Prisma fails
// with "resolved to an empty string." Passing an explicit env object to
// each spawned command sidesteps that entirely.
const { execSync } = require("child_process");

// Plain `node` doesn't auto-load .env the way Next.js/Prisma's CLIs do —
// load it ourselves (without overriding anything the host platform, e.g.
// Vercel, already injected into process.env) so local `npm run build`
// behaves the same way.
try {
  require("dotenv").config();
} catch {
  // dotenv not installed — fine on a host that injects env vars directly.
}

const POOLED_CANDIDATES = ["DATABASE_URL", "POSTGRES_PRISMA_URL", "POSTGRES_URL", "DATABASE_URI"];
const DIRECT_CANDIDATES = ["DIRECT_URL", "POSTGRES_URL_NON_POOLING", "DATABASE_URL_UNPOOLED"];

function firstNonEmpty(names) {
  for (const name of names) {
    const value = process.env[name];
    if (value) return value;
  }
  return undefined;
}

const pooled = firstNonEmpty(POOLED_CANDIDATES);
const direct = firstNonEmpty(DIRECT_CANDIDATES) || pooled;

if (!pooled) {
  console.error(
    "[build] No usable Postgres connection string found (checked " +
      POOLED_CANDIDATES.join(", ") +
      "). Add a Postgres database in Vercel's Storage tab, or set DATABASE_URL yourself."
  );
  process.exit(1);
}

const env = { ...process.env, DATABASE_URL: pooled, DIRECT_URL: direct };

console.log(
  `[build] Resolved DATABASE_URL from ${pooled === process.env.DATABASE_URL ? "DATABASE_URL" : "a provider variable"}, ` +
    `DIRECT_URL from ${direct === process.env.DIRECT_URL && process.env.DIRECT_URL ? "DIRECT_URL" : "a provider variable / DATABASE_URL fallback"}.`
);

function run(cmd) {
  console.log(`[build] $ ${cmd}`);
  execSync(cmd, { env, stdio: "inherit" });
}

run("prisma generate");
run("prisma migrate deploy");
run("next build");
