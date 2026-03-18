import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notifyApplicationReceived } from "@/lib/notifications";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = await checkRateLimit(req, "moderate");
  if (limited) return limited;

  const session = await auth();
  if (!session || session.user.role !== "GROOMER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: shiftId } = await params;

  const groomer = await prisma.groomerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, fullName: true },
  });

  if (!groomer) {
    return NextResponse.json({ error: "Groomer profile not found" }, { status: 404 });
  }

  const shift = await prisma.shiftPost.findUnique({
    where: { id: shiftId },
    include: {
      salon: { select: { id: true, name: true, city: true } },
    },
  });

  if (!shift) {
    return NextResponse.json({ error: "Shift not found" }, { status: 404 });
  }

  if (shift.status === "FILLED") {
    return NextResponse.json({ error: "This shift has already been filled" }, { status: 400 });
  }

  if (shift.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Shift not available" }, { status: 404 });
  }

  // Check for duplicate application
  const existing = await prisma.application.findFirst({
    where: { shiftPostId: shiftId, groomerId: groomer.id },
  });

  if (existing) {
    return NextResponse.json({ error: "ALREADY_APPLIED" }, { status: 409 });
  }

  let application;
  try {
    application = await prisma.application.create({
      data: {
        postType: "SHIFT",
        shiftPostId: shiftId,
        salonId: shift.salon.id,
        groomerId: groomer.id,
        status: "APPLIED",
      },
    });
  } catch (e: unknown) {
    if ((e as { code?: string })?.code === "P2002") {
      return NextResponse.json({ error: "ALREADY_APPLIED" }, { status: 409 });
    }
    throw e;
  }

  // Notify salon
  const salonProfile = await prisma.salonProfile.findUnique({
    where: { id: shift.salon.id },
    select: { userId: true },
  });

  if (!salonProfile) {
    return NextResponse.json({ error: "Salon profile not found" }, { status: 404 });
  }

  const salonUser = await prisma.user.findUnique({
    where: { id: salonProfile.userId },
    select: { email: true },
  });

  if (salonUser?.email) {
    notifyApplicationReceived({
      salonEmail: salonUser.email,
      salonName: shift.salon.name,
      groomerName: groomer.fullName,
      shiftDate: shift.date.toISOString().split("T")[0],
      shiftCity: shift.city,
      shiftId,
    }).catch((err) => console.error("Notification failed", err));
  }

  return NextResponse.json({ application }, { status: 201 });
}
