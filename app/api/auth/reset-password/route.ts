import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

const Schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

export async function POST(req: NextRequest) {
  const limited = await checkRateLimit(req, "strict");
  if (limited) return limited;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const { token, password } = parsed.data;

  // Find and validate token
  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!record) {
    return NextResponse.json({ error: "INVALID_TOKEN" }, { status: 400 });
  }

  if (record.expires < new Date()) {
    // Clean up expired token
    await prisma.verificationToken.delete({
      where: { token },
    });
    return NextResponse.json({ error: "EXPIRED_TOKEN" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: record.identifier },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: "INVALID_TOKEN" }, { status: 400 });
  }

  // Hash new password and update user — then delete token (atomic)
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    }),
    prisma.verificationToken.delete({
      where: { token },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
