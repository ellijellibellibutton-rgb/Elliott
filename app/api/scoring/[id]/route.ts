import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";

const bodySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  type: z.enum(["FIXED", "DOLLAR"]).optional(),
  statKind: z
    .enum(["DOLLARS", "BUSINESS_CONTACTED", "MEETING", "PITCH", "BONUS"])
    .optional(),
  pointValue: z.number().optional(),
  pointsPer100: z.number().optional(),
  enabled: z.boolean().optional(),
  order: z.number().optional(),
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
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  const category = await prisma.scoringCategory.update({
    where: { id },
    data: parsed.data,
  });
  return NextResponse.json(category);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;
  const { id } = await params;

  await prisma.scoringCategory.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
