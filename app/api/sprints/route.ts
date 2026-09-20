import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";

export async function GET() {
  const sprints = await prisma.sprint.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(sprints);
}

const bodySchema = z.object({
  name: z.string().min(1),
  description: z.string().default(""),
  startDate: z.string(),
  endDate: z.string(),
  status: z.enum(["UPCOMING", "ACTIVE", "COMPLETED"]).default("UPCOMING"),
  bonusOpportunities: z.string().default(""),
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

  const count = await prisma.sprint.count();
  const sprint = await prisma.sprint.create({
    data: {
      ...parsed.data,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
      order: count,
    },
  });
  return NextResponse.json(sprint, { status: 201 });
}
