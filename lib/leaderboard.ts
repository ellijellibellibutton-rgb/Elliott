import { prisma } from "./prisma";
import { computeActivityPoints } from "./scoring";

export type TeamStats = {
  teamId: string;
  name: string;
  slug: string;
  color: string;
  logo: string;
  slogan: string;
  totalPoints: number;
  dollarsRaised: number;
  businessesContacted: number;
  meetings: number;
  pitches: number;
  bonusPoints: number;
};

const EMPTY_STATS = (): Omit<TeamStats, "teamId" | "name" | "slug" | "color" | "logo" | "slogan"> => ({
  totalPoints: 0,
  dollarsRaised: 0,
  businessesContacted: 0,
  meetings: 0,
  pitches: 0,
  bonusPoints: 0,
});

/**
 * Computes per-team aggregate stats from approved activities, optionally
 * only counting activities on or before `asOf` (used to compute prior-week
 * standings for movement indicators).
 */
export async function computeTeamStats(asOf?: Date): Promise<TeamStats[]> {
  const teams = await prisma.team.findMany({
    where: { archived: false },
    orderBy: { order: "asc" },
  });

  const activities = await prisma.activity.findMany({
    where: {
      approvalStatus: "APPROVED",
      ...(asOf ? { date: { lte: asOf } } : {}),
    },
    include: { category: true },
  });

  const wins = await prisma.winOfWeek.findMany({
    where: {
      teamId: { not: null },
      ...(asOf ? { date: { lte: asOf } } : {}),
    },
  });

  const byTeam = new Map<string, ReturnType<typeof EMPTY_STATS>>();
  for (const team of teams) byTeam.set(team.id, EMPTY_STATS());

  for (const activity of activities) {
    const stats = byTeam.get(activity.teamId);
    if (!stats) continue;
    // Points are recomputed live from the activity's current scoring
    // category so admin edits to point values recalculate everything
    // retroactively, not just new activity.
    const points = computeActivityPoints(activity.category, {
      quantity: activity.quantity,
      dollarAmount: activity.dollarAmount,
    });
    stats.totalPoints += points;
    switch (activity.category.statKind) {
      case "DOLLARS":
        stats.dollarsRaised += activity.dollarAmount;
        break;
      case "BUSINESS_CONTACTED":
        stats.businessesContacted += activity.quantity;
        break;
      case "MEETING":
        stats.meetings += activity.quantity;
        break;
      case "PITCH":
        stats.pitches += activity.quantity;
        break;
      case "BONUS":
        stats.bonusPoints += points;
        break;
    }
  }

  // Win of the Week bonus points also count toward a team's total & bonus.
  for (const win of wins) {
    if (!win.teamId) continue;
    const stats = byTeam.get(win.teamId);
    if (!stats) continue;
    stats.totalPoints += win.bonusPoints;
    stats.bonusPoints += win.bonusPoints;
  }

  return teams.map((team) => ({
    teamId: team.id,
    name: team.name,
    slug: team.slug,
    color: team.color,
    logo: team.logo,
    slogan: team.slogan,
    ...byTeam.get(team.id)!,
  }));
}

export type LeaderboardRow = TeamStats & {
  rank: number;
  previousRank: number | null;
  movement: number | null;
};

export async function computeLeaderboard(): Promise<LeaderboardRow[]> {
  const current = await computeTeamStats();

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const previous = await computeTeamStats(oneWeekAgo);

  const sortedCurrent = [...current].sort(
    (a, b) => b.totalPoints - a.totalPoints
  );
  const sortedPrevious = [...previous].sort(
    (a, b) => b.totalPoints - a.totalPoints
  );

  const previousRankByTeam = new Map<string, number>();
  sortedPrevious.forEach((team, idx) => {
    previousRankByTeam.set(team.teamId, idx + 1);
  });

  return sortedCurrent.map((team, idx) => {
    const rank = idx + 1;
    const previousRank = previousRankByTeam.get(team.teamId) ?? null;
    const movement = previousRank !== null ? previousRank - rank : null;
    return { ...team, rank, previousRank, movement };
  });
}

export async function getCurrentSprint() {
  const now = new Date();
  const active = await prisma.sprint.findFirst({
    where: { startDate: { lte: now }, endDate: { gte: now } },
    orderBy: { order: "asc" },
  });
  if (active) return active;
  return prisma.sprint.findFirst({
    where: { status: "ACTIVE" },
    orderBy: { order: "asc" },
  });
}
