import { NextResponse } from "next/server";
import { computeLeaderboard, getCurrentSprint } from "@/lib/leaderboard";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [leaderboard, currentSprint, latestWin] = await Promise.all([
    computeLeaderboard(),
    getCurrentSprint(),
    prisma.winOfWeek.findFirst({
      orderBy: { date: "desc" },
      include: { award: true, team: true },
    }),
  ]);

  return NextResponse.json({ leaderboard, currentSprint, latestWin });
}
