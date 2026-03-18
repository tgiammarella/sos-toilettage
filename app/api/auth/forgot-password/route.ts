import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { notifyPasswordReset } from "@/lib/notifications";

const Schema = z.object({
  email: z.string().email(),
});

const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

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
    // Always return 200 to avoid email enumeration
    return NextResponse.json({ ok: true });
  }

  const { email } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true, email: true, isBanned: true },
  });

  // Always return success — never reveal whether the email exists
  if (!user || user.isBanned) {
    return NextResponse.json({ ok: true });
  }

  // Delete any existing tokens for this user
  await prisma.verificationToken.deleteMany({
    where: { identifier: user.email },
  });

  // Generate secure token
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + TOKEN_EXPIRY_MS);

  await prisma.verificationToken.create({
    data: {
      identifier: user.email,
      token,
      expires,
    },
  });

  // Send reset email (fire-and-forget)
  notifyPasswordReset({
    email: user.email,
    token,
  }).catch((err) => console.error("Password reset email failed", err));

  return NextResponse.json({ ok: true });
}
