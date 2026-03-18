import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const BanSchema = z.object({
  reason: z.string().min(1, "Reason is required"),
  notes: z.string().optional(),
  blockEmail: z.boolean().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: userId } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = BanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", issues: parsed.error.flatten() }, { status: 422 });
  }

  const { reason, notes, blockEmail } = parsed.data;

  const target = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (target.role === "ADMIN") {
    return NextResponse.json({ error: "Cannot ban an admin" }, { status: 403 });
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: true,
        bannedAt: new Date(),
        bannedReason: reason,
        bannedNotes: notes ?? null,
        bannedByUserId: session.user.id,
        ...(blockEmail ? { moderationEmailBlocked: true } : {}),
      },
    }),
    prisma.adminModerationAction.create({
      data: {
        userId,
        adminUserId: session.user.id,
        actionType: "BAN",
        reason,
        notes,
      },
    }),
    ...(blockEmail
      ? [
          prisma.adminModerationAction.create({
            data: {
              userId,
              adminUserId: session.user.id,
              actionType: "BLOCK_EMAIL",
              reason: "Blocked alongside ban",
            },
          }),
        ]
      : []),
  ]);

  return NextResponse.json({ ok: true });
}
