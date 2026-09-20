import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";

export async function GET() {
  const categories = await prisma.scoringCategory.findMany({
    orderBy: { order: "asc" },
  });
  return NextResponse.json(categories);
}

const bodySchema = z.object({
  name: z.string().min(1),
  description: z.string().default(""),
  type: z.enum(["FIXED", "DOLLAR"]).default("FIXED"),
  statKind: z
    .enum(["DOLLARS", "BUSINESS_CONTACTED", "MEETING", "PITCH", "BONUS"])
    .default("BONUS"),
  pointValue: z.number().default(0),
  pointsPer100: z.number().default(0),
  enabled: z.boolean().default(true),
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

  const count = await prisma.scoringCategory.count();
  const category = await prisma.scoringCategory.create({
    data: { ...parsed.data, order: count },
  });
  return NextResponse.json(category, { status: 201 });
}
