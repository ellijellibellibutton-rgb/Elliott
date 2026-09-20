import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";

const bodySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  slogan: z.string().optional(),
  color: z.string().optional(),
  logo: z.string().optional(),
  archived: z.boolean().optional(),
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

  const team = await prisma.team.update({ where: { id }, data: parsed.data });
  return NextResponse.json(team);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;
  const { id } = await params;

  await prisma.team.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
