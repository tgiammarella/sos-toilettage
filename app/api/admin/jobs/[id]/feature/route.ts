import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof (body as Record<string, unknown>)?.isFeatured !== "boolean") {
    return NextResponse.json({ error: "isFeatured must be a boolean" }, { status: 422 });
  }

  const job = await prisma.jobPost.findUnique({ where: { id }, select: { id: true } });
  if (!job) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.jobPost.update({
    where: { id },
    data: { isFeatured: (body as { isFeatured: boolean }).isFeatured },
  });

  return NextResponse.json({ ok: true });
}
