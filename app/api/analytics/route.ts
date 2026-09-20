import { NextRequest, NextResponse } from "next/server";
import { computeAnalytics } from "@/lib/analytics";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const analytics = await computeAnalytics({
    teamId: searchParams.get("teamId") || undefined,
    sprintId: searchParams.get("sprintId") || undefined,
    categoryId: searchParams.get("categoryId") || undefined,
    from: searchParams.get("from") || undefined,
    to: searchParams.get("to") || undefined,
  });
  return NextResponse.json(analytics);
}
