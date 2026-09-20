import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";

export async function GET() {
  const rules = await prisma.rule.findMany({ orderBy: [{ section: "asc" }, { order: "asc" }] });
  return NextResponse.json(rules);
}

const bodySchema = z.object({
  section: z.enum(["VERIFICATION", "COMPETITION"]),
  title: z.string().min(1),
  content: z.string().default(""),
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

  const count = await prisma.rule.count({ where: { section: parsed.data.section } });
  const rule = await prisma.rule.create({ data: { ...parsed.data, order: count } });
  return NextResponse.json(rule, { status: 201 });
}
