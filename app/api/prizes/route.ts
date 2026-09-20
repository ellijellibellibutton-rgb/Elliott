import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";

export async function GET() {
  const prizes = await prisma.prize.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(prizes);
}

const bodySchema = z.object({
  name: z.string().min(1),
  description: z.string().default(""),
  icon: z.string().default("🎁"),
  eligibility: z.string().default(""),
  requiredRank: z.number().nullable().optional(),
  requiredPoints: z.number().nullable().optional(),
  quantity: z.number().default(1),
  claimed: z.boolean().default(false),
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

  const count = await prisma.prize.count();
  const prize = await prisma.prize.create({ data: { ...parsed.data, order: count } });
  return NextResponse.json(prize, { status: 201 });
}
