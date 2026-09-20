// Build orchestrator for Vercel (and any other host running `npm run build`).
//
// A connected Postgres integration (Vercel's own, Neon, Supabase, ...)
// injects connection strings under whatever variable names that specific
// integration setup uses — including any custom prefix the admin chose
// when connecting it (e.g. `POSTGRES_URL_POSTGRES_PRISMA_URL`,
// `POSTGRES_URL_NON_POOLING`). Guessing a fixed list of exact names is
// fragile, so instead we scan every env var for one whose *value* looks
// like a Postgres connection string, and use name hints to pick the
// pooled one apart from the direct/non-pooling one. See lib/dbUrl.ts for
// the same logic used at runtime.
//
// Either way, we pass the resolved values directly to each spawned
// command's environment — NOT via a .env file — because dotenv-style
// loaders (which the Prisma CLI uses) refuse to override a variable that
// already exists in process.env, even if it's set to an empty string.
// That "already exists but empty" case happens if DATABASE_URL/DIRECT_URL
// was ever manually added in the Vercel dashboard with no value: writing
// to .env would silently have no effect there.
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

const CONNECTION_STRING_RE = /^postgres(ql)?:\/\//i;
const DIRECT_NAME_HINT_RE = /NON.?POOLING|UNPOOLED|_DIRECT_/i;
const PRISMA_NAME_HINT_RE = /PRISMA/i;

function findConnectionStrings() {
  return Object.entries(process.env).filter(
    ([, value]) => typeof value === "string" && CONNECTION_STRING_RE.test(value)
  );
}

function resolvePooled(candidates) {
  if (process.env.DATABASE_URL) return { value: process.env.DATABASE_URL, source: "DATABASE_URL" };
  const nonDirect = candidates.filter(([name]) => !DIRECT_NAME_HINT_RE.test(name));
  const prismaMatch = nonDirect.find(([name]) => PRISMA_NAME_HINT_RE.test(name));
  const picked = prismaMatch ?? nonDirect[0] ?? candidates[0];
  return picked ? { value: picked[1], source: picked[0] } : { value: undefined, source: null };
}

function resolveDirect(candidates, pooled) {
  if (process.env.DIRECT_URL) return { value: process.env.DIRECT_URL, source: "DIRECT_URL" };
  const directMatch = candidates.find(([name]) => DIRECT_NAME_HINT_RE.test(name));
  if (directMatch) return { value: directMatch[1], source: directMatch[0] };
  return { value: pooled.value, source: pooled.source ? `${pooled.source} (fallback)` : null };
}

const candidates = findConnectionStrings();
const pooled = resolvePooled(candidates);
const direct = resolveDirect(candidates, pooled);

if (!pooled.value) {
  console.error(
    "[build] No Postgres connection string found anywhere in the environment. " +
      "Add a Postgres database in Vercel's Storage tab and make sure it's connected " +
      "to this project, or set DATABASE_URL yourself in Project Settings."
  );
  process.exit(1);
}

console.log(`[build] Using DATABASE_URL from ${pooled.source}, DIRECT_URL from ${direct.source}.`);

const env = { ...process.env, DATABASE_URL: pooled.value, DIRECT_URL: direct.value };

function run(cmd) {
  console.log(`[build] $ ${cmd}`);
  execSync(cmd, { env, stdio: "inherit" });
}

run("prisma generate");
run("prisma migrate deploy");
run("next build");
