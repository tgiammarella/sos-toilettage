import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: userId } = await params;

  const target = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { moderationEmailBlocked: false },
    }),
    prisma.adminModerationAction.create({
      data: {
        userId,
        adminUserId: session.user.id,
        actionType: "UNBLOCK_EMAIL",
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
