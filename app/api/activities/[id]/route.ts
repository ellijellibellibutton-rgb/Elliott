import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";
import { computeActivityPoints } from "@/lib/scoring";

const bodySchema = z.object({
  teamId: z.string().min(1).optional(),
  studentId: z.string().optional().nullable(),
  categoryId: z.string().min(1).optional(),
  sprintId: z.string().optional().nullable(),
  date: z.string().optional(),
  quantity: z.number().optional(),
  dollarAmount: z.number().optional(),
  notes: z.string().optional(),
  evidence: z.string().optional(),
  approvalStatus: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
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

  const existing = await prisma.activity.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Activity not found." }, { status: 404 });
  }

  const categoryId = parsed.data.categoryId ?? existing.categoryId;
  const category =
    categoryId === existing.categoryId
      ? existing.category
      : await prisma.scoringCategory.findUnique({ where: { id: categoryId } });
  if (!category) {
    return NextResponse.json({ error: "Scoring category not found." }, { status: 404 });
  }

  const quantity = parsed.data.quantity ?? existing.quantity;
  const dollarAmount = parsed.data.dollarAmount ?? existing.dollarAmount;
  const pointsAwarded = computeActivityPoints(category, { quantity, dollarAmount });

  const activity = await prisma.activity.update({
    where: { id },
    data: {
      ...parsed.data,
      date: parsed.data.date ? new Date(parsed.data.date) : undefined,
      pointsAwarded,
    },
    include: { team: true, student: true, category: true, sprint: true },
  });

  return NextResponse.json(activity);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;
  const { id } = await params;

  await prisma.activity.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
