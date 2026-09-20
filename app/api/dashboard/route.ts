import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeLeaderboard, getCurrentSprint } from "@/lib/leaderboard";
import { computeAnalytics } from "@/lib/analytics";

export async function GET() {
  const now = new Date();

  const [
    settings,
    leaderboard,
    currentSprint,
    latestWin,
    recentActivity,
    scoringCategories,
    nextMeeting,
    prizes,
    analytics,
  ] = await Promise.all([
    prisma.campaignSettings.findFirst(),
    computeLeaderboard(),
    getCurrentSprint(),
    prisma.winOfWeek.findFirst({
      orderBy: { date: "desc" },
      include: { award: true, team: true },
    }),
    prisma.activity.findMany({
      where: { approvalStatus: "APPROVED" },
      orderBy: { date: "desc" },
      take: 8,
      include: { team: true, category: true, student: true },
    }),
    prisma.scoringCategory.findMany({
      where: { enabled: true },
      orderBy: { order: "asc" },
    }),
    prisma.meeting.findFirst({
      where: { date: { gte: now } },
      orderBy: { date: "asc" },
      include: { sprint: true },
    }),
    prisma.prize.findMany({ orderBy: { order: "asc" }, take: 6 }),
    computeAnalytics(),
  ]);

  return NextResponse.json({
    settings,
    leaderboard,
    currentSprint,
    latestWin,
    recentActivity,
    scoringCategories,
    nextMeeting,
    prizes,
    totals: analytics.totals,
  });
}
