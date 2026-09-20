import { NextRequest, NextResponse } from "next/server";
import { isRequestAuthenticated } from "./auth";

/**
 * Returns a 401 NextResponse if the request is not an authenticated admin
 * session, otherwise returns null so the caller can proceed.
 */
export async function requireAdmin(
  request: NextRequest
): Promise<NextResponse | null> {
  const ok = await isRequestAuthenticated(request);
  if (!ok) {
    return NextResponse.json(
      { error: "Unauthorized. Admin login required." },
      { status: 401 }
    );
  }
  return null;
}
