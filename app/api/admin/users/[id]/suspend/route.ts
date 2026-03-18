import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const SuspendSchema = z.object({
  reason: z.string().min(1, "Reason is required"),
  notes: z.string().optional(),
  suspensionEndsAt: z.string().min(1, "End date is required"),
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

  const parsed = SuspendSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", issues: parsed.error.flatten() }, { status: 422 });
  }

  const { reason, notes, suspensionEndsAt } = parsed.data;
  const endsAt = new Date(suspensionEndsAt);

  if (endsAt <= new Date()) {
    return NextResponse.json({ error: "Suspension end date must be in the future" }, { status: 422 });
  }

  const target = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (target.role === "ADMIN") {
    return NextResponse.json({ error: "Cannot suspend an admin" }, { status: 403 });
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        isSuspended: true,
        suspendedAt: new Date(),
        suspensionEndsAt: endsAt,
        suspendedReason: reason,
        suspendedNotes: notes ?? null,
        suspendedByUserId: session.user.id,
      },
    }),
    prisma.adminModerationAction.create({
      data: {
        userId,
        adminUserId: session.user.id,
        actionType: "SUSPEND",
        reason,
        notes,
        effectiveUntil: endsAt,
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
