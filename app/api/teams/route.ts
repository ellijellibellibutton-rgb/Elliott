import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";

function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || `team-${Date.now()}`
  );
}

export async function GET() {
  const teams = await prisma.team.findMany({
    orderBy: { order: "asc" },
    include: { students: { orderBy: { name: "asc" } } },
  });
  return NextResponse.json(teams);
}

const bodySchema = z.object({
  name: z.string().min(1),
  description: z.string().default(""),
  slogan: z.string().default(""),
  color: z.string().default("#2a78d6"),
  logo: z.string().default(""),
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

  const count = await prisma.team.count();
  let slug = slugify(parsed.data.name);
  const existing = await prisma.team.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const team = await prisma.team.create({
    data: { ...parsed.data, slug, order: count },
  });

  return NextResponse.json(team, { status: 201 });
}
