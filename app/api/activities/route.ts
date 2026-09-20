import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";
import { computeActivityPoints } from "@/lib/scoring";

export async function GET(request: NextRequest) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  const activities = await prisma.activity.findMany({
    orderBy: { date: "desc" },
    include: { team: true, student: true, category: true, sprint: true },
    take: 300,
  });
  return NextResponse.json(activities);
}

const bodySchema = z.object({
  teamId: z.string().min(1),
  studentId: z.string().optional().nullable(),
  categoryId: z.string().min(1),
  sprintId: z.string().optional().nullable(),
  date: z.string().optional(),
  quantity: z.number().default(1),
  dollarAmount: z.number().default(0),
  notes: z.string().default(""),
  evidence: z.string().default(""),
  approvalStatus: z.enum(["PENDING", "APPROVED", "REJECTED"]).default("APPROVED"),
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

  const category = await prisma.scoringCategory.findUnique({
    where: { id: parsed.data.categoryId },
  });
  if (!category) {
    return NextResponse.json({ error: "Scoring category not found." }, { status: 404 });
  }

  const pointsAwarded = computeActivityPoints(category, {
    quantity: parsed.data.quantity,
    dollarAmount: parsed.data.dollarAmount,
  });

  const activity = await prisma.activity.create({
    data: {
      teamId: parsed.data.teamId,
      studentId: parsed.data.studentId || null,
      categoryId: parsed.data.categoryId,
      sprintId: parsed.data.sprintId || null,
      date: parsed.data.date ? new Date(parsed.data.date) : new Date(),
      quantity: parsed.data.quantity,
      dollarAmount: parsed.data.dollarAmount,
      notes: parsed.data.notes,
      evidence: parsed.data.evidence,
      approvalStatus: parsed.data.approvalStatus,
      pointsAwarded,
    },
    include: { team: true, student: true, category: true, sprint: true },
  });

  return NextResponse.json(activity, { status: 201 });
}
