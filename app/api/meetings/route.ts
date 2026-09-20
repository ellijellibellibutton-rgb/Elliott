import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";

export async function GET() {
  const meetings = await prisma.meeting.findMany({
    orderBy: { date: "asc" },
    include: { sprint: true },
  });
  return NextResponse.json(meetings);
}

const bodySchema = z.object({
  date: z.string(),
  title: z.string().min(1),
  sprintId: z.string().optional().nullable(),
  energyOpener: z.string().default(""),
  sprintChallenge: z.string().default(""),
  workBlockNotes: z.string().default(""),
  nextMeetingGoal: z.string().default(""),
});

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  const meeting = await prisma.meeting.create({
    data: {
      ...parsed.data,
      sprintId: parsed.data.sprintId || null,
      date: new Date(parsed.data.date),
    },
    include: { sprint: true },
  });
  return NextResponse.json(meeting, { status: 201 });
}
