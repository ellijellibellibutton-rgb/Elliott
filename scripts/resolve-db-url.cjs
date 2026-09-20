// Runs before `prisma migrate deploy` during the Vercel build step.
// The Prisma CLI reads schema.prisma's env("DATABASE_URL")/env("DIRECT_URL")
// literally — it can't fall back between provider-specific variable names
// the way our app code can at runtime (see lib/dbUrl.ts). So if this
// project's own DATABASE_URL/DIRECT_URL aren't set, but a known Postgres
// integration's variables are, write them into a `.env` file the Prisma
// CLI (and Next.js) will pick up for the rest of this build.
const fs = require("fs");
const path = require("path");

// Plain `node` doesn't auto-load .env the way Next.js/Prisma's CLIs do —
// load it ourselves so vars already sitting in .env are visible here too.
const dotEnvPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(dotEnvPath)) {
  for (const line of fs.readFileSync(dotEnvPath, "utf8").split("\n")) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (!match) continue;
    const key = match[1];
    let value = (match[2] || "").trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

const POOLED_CANDIDATES = ["DATABASE_URL", "POSTGRES_PRISMA_URL", "POSTGRES_URL", "DATABASE_URI"];
const DIRECT_CANDIDATES = ["DIRECT_URL", "POSTGRES_URL_NON_POOLING", "DATABASE_URL_UNPOOLED"];

function firstDefined(names) {
  for (const name of names) {
    if (process.env[name]) return process.env[name];
  }
  return undefined;
}

const pooled = firstDefined(POOLED_CANDIDATES);
const direct = firstDefined(DIRECT_CANDIDATES) ?? pooled;

if (!pooled) {
  console.warn(
    "[resolve-db-url] No DATABASE_URL/POSTGRES_PRISMA_URL/POSTGRES_URL found in env. " +
      "Add a Postgres database in Vercel's Storage tab, or set DATABASE_URL manually."
  );
  process.exit(0);
}

const lines = [];
if (!process.env.DATABASE_URL) lines.push(`DATABASE_URL="${pooled}"`);
if (!process.env.DIRECT_URL && direct) lines.push(`DIRECT_URL="${direct}"`);

if (lines.length > 0) {
  const envPath = path.join(__dirname, "..", ".env");
  fs.appendFileSync(envPath, "\n" + lines.join("\n") + "\n");
  console.log(`[resolve-db-url] Wrote ${lines.length} resolved variable(s) to .env for this build.`);
} else {
  console.log("[resolve-db-url] DATABASE_URL/DIRECT_URL already set — nothing to do.");
}
