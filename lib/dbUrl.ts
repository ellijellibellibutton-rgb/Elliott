/**
 * Vercel's own Postgres integration (and most marketplace Postgres
 * providers, e.g. Neon/Supabase) auto-inject connection strings — but
 * under whatever variable names that particular integration setup uses,
 * which can include a custom prefix the admin chose when connecting it
 * (e.g. `POSTGRES_URL_POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`).
 * Guessing a fixed list of exact names is fragile, and those values are
 * often shown write-only/"Secret" in the dashboard so an admin can't even
 * view them to copy into a new variable. Instead, scan every environment
 * variable and pick out the ones whose *value* actually looks like a
 * Postgres connection string, then use name hints to tell the pooled
 * connection apart from the direct/non-pooling one.
 */

const CONNECTION_STRING_RE = /^postgres(ql)?:\/\//i;
const DIRECT_NAME_HINT_RE = /NON.?POOLING|UNPOOLED|_DIRECT_/i;
const PRISMA_NAME_HINT_RE = /PRISMA/i;

function findConnectionStrings(): Array<[string, string]> {
  return Object.entries(process.env).filter(
    (entry): entry is [string, string] =>
      typeof entry[1] === "string" && CONNECTION_STRING_RE.test(entry[1])
  );
}

export function resolvePooledDbUrl(): string | undefined {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const candidates = findConnectionStrings();
  const nonDirect = candidates.filter(([name]) => !DIRECT_NAME_HINT_RE.test(name));
  const prismaMatch = nonDirect.find(([name]) => PRISMA_NAME_HINT_RE.test(name));
  return (prismaMatch ?? nonDirect[0] ?? candidates[0])?.[1];
}

export function resolveDirectDbUrl(): string | undefined {
  if (process.env.DIRECT_URL) return process.env.DIRECT_URL;

  const candidates = findConnectionStrings();
  const directMatch = candidates.find(([name]) => DIRECT_NAME_HINT_RE.test(name));
  return directMatch?.[1] ?? resolvePooledDbUrl();
}
