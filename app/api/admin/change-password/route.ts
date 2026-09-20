import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";
import { hashPassword, verifyPassword } from "@/lib/auth";

const bodySchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6, "New password must be at least 6 characters."),
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

  const admin = await prisma.admin.findFirst({ orderBy: { id: "asc" } });
  if (!admin) {
    return NextResponse.json(
      { error: "Admin account not configured." },
      { status: 500 }
    );
  }

  const valid = await verifyPassword(
    parsed.data.currentPassword,
    admin.passwordHash
  );
  if (!valid) {
    return NextResponse.json(
      { error: "Current password is incorrect." },
      { status: 401 }
    );
  }

  const newHash = await hashPassword(parsed.data.newPassword);
  await prisma.admin.update({ where: { id: admin.id }, data: { passwordHash: newHash } });

  return NextResponse.json({ ok: true });
}
