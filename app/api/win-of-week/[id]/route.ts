import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";

const bodySchema = z.object({
  awardId: z.string().min(1).optional(),
  winnerName: z.string().min(1).optional(),
  teamId: z.string().optional().nullable(),
  date: z.string().optional(),
  description: z.string().optional(),
  bonusPoints: z.number().optional(),
  prize: z.string().optional(),
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

  const win = await prisma.winOfWeek.update({
    where: { id },
    data: {
      ...parsed.data,
      date: parsed.data.date ? new Date(parsed.data.date) : undefined,
    },
    include: { award: true, team: true },
  });
  return NextResponse.json(win);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;
  const { id } = await params;

  await prisma.winOfWeek.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
