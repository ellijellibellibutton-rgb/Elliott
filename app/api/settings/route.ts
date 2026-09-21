import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";

export async function GET() {
  let settings = await prisma.campaignSettings.findFirst();
  if (!settings) {
    settings = await prisma.campaignSettings.create({ data: {} });
  }
  return NextResponse.json(settings);
}

const bodySchema = z.object({
  campaignName: z.string().min(1),
  campaignDescription: z.string().default(""),
  committeeName: z.string().default(""),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  meetingSchedule: z.string().default(""),
  showTeamAvatars: z.boolean().default(true),
  showMoversOnDash: z.boolean().default(true),
  primaryAccent: z.string().default("#2a78d6"),
  heroImageUrl: z.string().default(""),
});

export async function PUT(request: NextRequest) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  const existing = await prisma.campaignSettings.findFirst();
  const data = {
    ...parsed.data,
    startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
    endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
  };

  const settings = existing
    ? await prisma.campaignSettings.update({ where: { id: existing.id }, data })
    : await prisma.campaignSettings.create({ data });

  return NextResponse.json(settings);
}
