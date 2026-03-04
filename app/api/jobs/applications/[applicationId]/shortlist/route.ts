import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "SALON") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { applicationId } = await params;

  const salon = await prisma.salonProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!salon) {
    return NextResponse.json({ error: "Salon not found" }, { status: 404 });
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { id: true, salonId: true, shortlisted: true },
  });

  if (!application || application.salonId !== salon.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.application.update({
    where: { id: applicationId },
    data: { shortlisted: !application.shortlisted },
    select: { shortlisted: true },
  });

  return NextResponse.json({ shortlisted: updated.shortlisted });
}
