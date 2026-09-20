import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";

export async function GET(request: NextRequest) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  const [
    settings,
    teams,
    students,
    scoringCategories,
    activities,
    sprints,
    judges,
    rules,
    prizes,
    awards,
    winOfWeek,
    meetings,
  ] = await Promise.all([
    prisma.campaignSettings.findFirst(),
    prisma.team.findMany(),
    prisma.student.findMany(),
    prisma.scoringCategory.findMany(),
    prisma.activity.findMany(),
    prisma.sprint.findMany(),
    prisma.judge.findMany(),
    prisma.rule.findMany(),
    prisma.prize.findMany(),
    prisma.award.findMany(),
    prisma.winOfWeek.findMany(),
    prisma.meeting.findMany(),
  ]);

  return NextResponse.json({
    exportedAt: new Date().toISOString(),
    settings,
    teams,
    students,
    scoringCategories,
    activities,
    sprints,
    judges,
    rules,
    prizes,
    awards,
    winOfWeek,
    meetings,
  });
}

const actionSchema = z.object({
  action: z.enum(["clear-demo-data", "clear-all-activities"]),
});

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  const parsed = actionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  }

  if (parsed.data.action === "clear-demo-data") {
    await prisma.$transaction([
      prisma.winOfWeek.deleteMany({ where: { isDemo: true } }),
      prisma.activity.deleteMany({ where: { isDemo: true } }),
      prisma.meeting.deleteMany({ where: { isDemo: true } }),
      prisma.student.deleteMany({ where: { isDemo: true } }),
      prisma.prize.deleteMany({ where: { isDemo: true } }),
      prisma.award.deleteMany({ where: { isDemo: true } }),
      prisma.judge.deleteMany({ where: { isDemo: true } }),
      prisma.rule.deleteMany({ where: { isDemo: true } }),
      prisma.sprint.deleteMany({ where: { isDemo: true } }),
      prisma.scoringCategory.deleteMany({ where: { isDemo: true } }),
      prisma.team.deleteMany({ where: { isDemo: true } }),
    ]);
    return NextResponse.json({ ok: true, message: "Demo data cleared." });
  }

  if (parsed.data.action === "clear-all-activities") {
    await prisma.activity.deleteMany({});
    return NextResponse.json({ ok: true, message: "All activities cleared." });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
