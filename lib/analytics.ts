import { prisma } from "./prisma";
import { computeActivityPoints } from "./scoring";
import { computeLeaderboard } from "./leaderboard";
import type { Prisma } from "@prisma/client";

export type AnalyticsFilters = {
  teamId?: string;
  sprintId?: string;
  categoryId?: string;
  from?: string;
  to?: string;
};

function isoWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export async function computeAnalytics(filters: AnalyticsFilters = {}) {
  const where: Prisma.ActivityWhereInput = { approvalStatus: "APPROVED" };
  if (filters.teamId) where.teamId = filters.teamId;
  if (filters.sprintId) where.sprintId = filters.sprintId;
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.from || filters.to) {
    where.date = {
      ...(filters.from ? { gte: new Date(filters.from) } : {}),
      ...(filters.to ? { lte: new Date(filters.to) } : {}),
    };
  }

  const [activities, teams, students, sprints, categories, winHistory, leaderboard] =
    await Promise.all([
      prisma.activity.findMany({
        where,
        include: { category: true, team: true, sprint: true },
        orderBy: { date: "asc" },
      }),
      prisma.team.count({ where: { archived: false } }),
      prisma.student.count({ where: { active: true } }),
      prisma.sprint.findMany({ orderBy: { order: "asc" } }),
      prisma.scoringCategory.findMany({ orderBy: { order: "asc" } }),
      prisma.winOfWeek.findMany({
        orderBy: { date: "desc" },
        include: { award: true, team: true },
        take: 50,
      }),
      computeLeaderboard(),
    ]);

  const totals = {
    totalPoints: 0,
    totalDollars: 0,
    businessesContacted: 0,
    meetings: 0,
    pitches: 0,
    activeTeams: teams,
    activeStudents: students,
  };

  const weeklyMap = new Map<
    string,
    { week: string; points: number; dollars: number; businesses: number; meetings: number; pitches: number }
  >();

  const categoryBreakdown = new Map<string, { name: string; points: number }>();
  const sprintBreakdown = new Map<
    string,
    { name: string; points: number; dollars: number; businesses: number; meetings: number; pitches: number }
  >();
  for (const sprint of sprints) {
    sprintBreakdown.set(sprint.id, {
      name: sprint.name,
      points: 0,
      dollars: 0,
      businesses: 0,
      meetings: 0,
      pitches: 0,
    });
  }

  for (const activity of activities) {
    const points = computeActivityPoints(activity.category, {
      quantity: activity.quantity,
      dollarAmount: activity.dollarAmount,
    });

    totals.totalPoints += points;
    if (activity.category.statKind === "DOLLARS") totals.totalDollars += activity.dollarAmount;
    if (activity.category.statKind === "BUSINESS_CONTACTED") totals.businessesContacted += activity.quantity;
    if (activity.category.statKind === "MEETING") totals.meetings += activity.quantity;
    if (activity.category.statKind === "PITCH") totals.pitches += activity.quantity;

    const weekKey = isoWeekKey(activity.date);
    const week = weeklyMap.get(weekKey) ?? {
      week: weekKey,
      points: 0,
      dollars: 0,
      businesses: 0,
      meetings: 0,
      pitches: 0,
    };
    week.points += points;
    if (activity.category.statKind === "DOLLARS") week.dollars += activity.dollarAmount;
    if (activity.category.statKind === "BUSINESS_CONTACTED") week.businesses += activity.quantity;
    if (activity.category.statKind === "MEETING") week.meetings += activity.quantity;
    if (activity.category.statKind === "PITCH") week.pitches += activity.quantity;
    weeklyMap.set(weekKey, week);

    const cat = categoryBreakdown.get(activity.categoryId) ?? {
      name: activity.category.name,
      points: 0,
    };
    cat.points += points;
    categoryBreakdown.set(activity.categoryId, cat);

    if (activity.sprintId) {
      const sprintStat = sprintBreakdown.get(activity.sprintId);
      if (sprintStat) {
        sprintStat.points += points;
        if (activity.category.statKind === "DOLLARS") sprintStat.dollars += activity.dollarAmount;
        if (activity.category.statKind === "BUSINESS_CONTACTED") sprintStat.businesses += activity.quantity;
        if (activity.category.statKind === "MEETING") sprintStat.meetings += activity.quantity;
        if (activity.category.statKind === "PITCH") sprintStat.pitches += activity.quantity;
      }
    }
  }

  const weeklyPerformance = Array.from(weeklyMap.values()).sort((a, b) =>
    a.week.localeCompare(b.week)
  );

  const categoryPerformance = categories
    .map((c) => ({
      id: c.id,
      name: c.name,
      points: categoryBreakdown.get(c.id)?.points ?? 0,
    }))
    .filter((c) => c.points > 0)
    .sort((a, b) => b.points - a.points);

  const sprintPerformance = sprints.map((s) => {
    const { name: _name, ...stats } = sprintBreakdown.get(s.id)!;
    void _name;
    return { id: s.id, name: s.name, status: s.status, ...stats };
  });

  return {
    totals,
    teamPerformance: leaderboard,
    weeklyPerformance,
    categoryPerformance,
    sprintPerformance,
    winHistory,
  };
}
