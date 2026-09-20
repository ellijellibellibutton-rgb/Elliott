import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";

export async function GET() {
  const awards = await prisma.award.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(awards);
}

const bodySchema = z.object({
  name: z.string().min(1),
  description: z.string().default(""),
  icon: z.string().default("🏅"),
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

  const count = await prisma.award.count();
  const award = await prisma.award.create({ data: { ...parsed.data, order: count } });
  return NextResponse.json(award, { status: 201 });
}
