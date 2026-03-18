import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const UnbanSchema = z.object({
  notes: z.string().optional(),
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
    body = {};
  }

  const parsed = UnbanSchema.safeParse(body);
  const notes = parsed.success ? parsed.data.notes : undefined;

  const target = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: false,
        bannedAt: null,
        bannedReason: null,
        bannedNotes: null,
        bannedByUserId: null,
      },
    }),
    prisma.adminModerationAction.create({
      data: {
        userId,
        adminUserId: session.user.id,
        actionType: "UNBAN",
        notes,
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
