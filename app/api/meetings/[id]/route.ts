import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";

const bodySchema = z.object({
  date: z.string().optional(),
  title: z.string().min(1).optional(),
  sprintId: z.string().optional().nullable(),
  energyOpener: z.string().optional(),
  sprintChallenge: z.string().optional(),
  workBlockNotes: z.string().optional(),
  nextMeetingGoal: z.string().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;
  const { id } = await params;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const meeting = await prisma.meeting.update({
    where: { id },
    data: {
      ...parsed.data,
      date: parsed.data.date ? new Date(parsed.data.date) : undefined,
    },
    include: { sprint: true },
  });
  return NextResponse.json(meeting);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;
  const { id } = await params;

  await prisma.meeting.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
