import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";

export async function GET() {
  const wins = await prisma.winOfWeek.findMany({
    orderBy: { date: "desc" },
    include: { award: true, team: true },
  });
  return NextResponse.json(wins);
}

const bodySchema = z.object({
  awardId: z.string().min(1),
  winnerName: z.string().min(1),
  teamId: z.string().optional().nullable(),
  date: z.string().optional(),
  description: z.string().default(""),
  bonusPoints: z.number().default(0),
  prize: z.string().default(""),
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

  const win = await prisma.winOfWeek.create({
    data: {
      ...parsed.data,
      teamId: parsed.data.teamId || null,
      date: parsed.data.date ? new Date(parsed.data.date) : new Date(),
    },
    include: { award: true, team: true },
  });
  return NextResponse.json(win, { status: 201 });
}
