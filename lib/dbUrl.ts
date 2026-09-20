/**
 * Vercel's own Postgres integration (and most marketplace Postgres
 * providers, e.g. Neon/Supabase) auto-inject connection strings under
 * their own variable names rather than the plain `DATABASE_URL` /
 * `DIRECT_URL` this app's Prisma schema expects. Rather than requiring
 * every admin to manually copy those values into new variables (fragile,
 * and those values are often shown write-only/"sensitive" in the
 * dashboard so they can't even be viewed to copy), we resolve them from
 * whichever known name is actually present.
 */
const POOLED_CANDIDATES = [
  "DATABASE_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL",
  "DATABASE_URI",
];

const DIRECT_CANDIDATES = [
  "DIRECT_URL",
  "POSTGRES_URL_NON_POOLING",
  "DATABASE_URL_UNPOOLED",
];

function firstDefined(names: string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name];
    if (value) return value;
  }
  return undefined;
}

export function resolvePooledDbUrl(): string | undefined {
  return firstDefined(POOLED_CANDIDATES);
}

export function resolveDirectDbUrl(): string | undefined {
  return firstDefined(DIRECT_CANDIDATES) ?? resolvePooledDbUrl();
}
