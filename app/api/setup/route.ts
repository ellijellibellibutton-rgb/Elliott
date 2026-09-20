import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { seedDatabase } from "@/lib/seedData";

/**
 * One-time setup endpoint so a fresh deploy can be initialized by visiting
 * a URL in a browser, instead of requiring a local Node/Prisma CLI setup.
 * Gated behind ADMIN_SESSION_SECRET (already required for the app to run),
 * not a separate secret to configure. Safe to call more than once — every
 * step in seedDatabase() checks its own table before inserting.
 */
export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");
  const expected = process.env.ADMIN_SESSION_SECRET;

  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_SESSION_SECRET is not configured on the server." },
      { status: 500 }
    );
  }
  if (!key || key !== expected) {
    return NextResponse.json(
      { error: "Missing or incorrect ?key= — pass your ADMIN_SESSION_SECRET value." },
      { status: 403 }
    );
  }

  const log = await seedDatabase(prisma);

  return NextResponse.json({
    ok: true,
    message: "Setup complete. Go to /admin and log in with AAPLE2026, then change the password.",
    log,
  });
}
