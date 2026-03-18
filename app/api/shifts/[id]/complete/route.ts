import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { recalculateReliabilityScore } from "@/lib/reliability";
import { notifyReviewRequest } from "@/lib/notifications";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const limited = await checkRateLimit(req, "moderate");
  if (limited) return limited;

  const session = await auth();
  if (!session || session.user.role !== "SALON") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const salon = await prisma.salonProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, name: true },
  });

  if (!salon) {
    return NextResponse.json({ error: "Salon not found" }, { status: 404 });
  }

  const shift = await prisma.shiftPost.findUnique({
    where: { id },
    select: { id: true, salonId: true, status: true, date: true, startTime: true, city: true },
  });

  if (!shift) {
    return NextResponse.json({ error: "Shift not found" }, { status: 404 });
  }

  if (shift.salonId !== salon.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (shift.status !== "FILLED") {
    return NextResponse.json(
      { error: "INVALID_STATUS", message: "Seul un remplacement comblé peut être marqué comme complété." },
      { status: 409 },
    );
  }

  // Cannot complete before shift date/time has passed
  const [hours, minutes] = shift.startTime.split(":").map(Number);
  const shiftEnd = new Date(shift.date);
  // Assume shift lasts ~8h from start; conservative: just check start time has passed
  shiftEnd.setHours(hours, minutes, 0, 0);

  if (new Date() < shiftEnd) {
    return NextResponse.json(
      { error: "TOO_EARLY", message: "Le remplacement ne peut pas être complété avant l'heure prévue." },
      { status: 409 },
    );
  }

  const updated = await prisma.shiftPost.update({
    where: { id },
    data: { status: "COMPLETED", completedAt: new Date() },
  });

  // Recalculate groomer reliability score + send review request (fire-and-forget)
  const engagement = await prisma.engagement.findUnique({
    where: { shiftPostId: id },
    select: { groomerId: true, groomer: { select: { fullName: true } } },
  });
  if (engagement) {
    recalculateReliabilityScore(engagement.groomerId).catch((err) =>
      console.error("[RELIABILITY] Recalc failed", err),
    );

    const salonUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    });
    if (salonUser?.email) {
      notifyReviewRequest({
        salonEmail: salonUser.email,
        salonName: salon.name,
        groomerName: engagement.groomer.fullName,
        shiftDate: shift.date.toISOString().split("T")[0],
        shiftCity: shift.city,
        shiftId: id,
      }).catch((err) => console.error("Review request email failed", err));
    }
  }

  return NextResponse.json({ shift: updated });
}
