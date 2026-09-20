import { NextRequest, NextResponse } from "next/server";
import { isRequestAuthenticated } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const authenticated = await isRequestAuthenticated(request);
  return NextResponse.json({ authenticated });
}
