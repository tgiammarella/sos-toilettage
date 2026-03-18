import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notifyApplicationAccepted, notifyApplicationRejected, notifyShiftFilled } from "@/lib/notifications";
import { checkRateLimit } from "@/lib/rate-limit";

const AcceptSchema = z.object({
  applicationId: z.string().min(1),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = await checkRateLimit(req, "moderate");
  if (limited) return limited;

  const session = await auth();
  if (!session || session.user.role !== "SALON") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: shiftId } = await params;

  const salon = await prisma.salonProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, name: true, address: true },
  });

  if (!salon) {
    return NextResponse.json({ error: "Salon profile not found" }, { status: 404 });
  }

  const shift = await prisma.shiftPost.findUnique({
    where: { id: shiftId },
    select: { id: true, salonId: true, status: true, date: true, startTime: true, city: true },
  });

  if (!shift) {
    return NextResponse.json({ error: "Shift not found" }, { status: 404 });
  }

  if (shift.salonId !== salon.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (shift.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Shift is not open for acceptance" }, { status: 409 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = AcceptSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", issues: parsed.error.flatten() }, { status: 422 });
  }

  const { applicationId } = parsed.data;

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
  });

  if (!application || application.shiftPostId !== shiftId || application.status !== "APPLIED") {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  const groomerId = application.groomerId;

  // Atomically: accept chosen application, reject all others, fill shift, create engagement
  const engagement = await prisma.$transaction(async (tx) => {
    await tx.application.update({
      where: { id: applicationId },
      data: { status: "ACCEPTED" },
    });

    await tx.application.updateMany({
      where: { shiftPostId: shiftId, status: "APPLIED", id: { not: applicationId } },
      data: { status: "REJECTED" },
    });

    await tx.shiftPost.update({
      where: { id: shiftId },
      data: { status: "FILLED", filledAt: new Date() },
    });

    return tx.engagement.create({
      data: {
        shiftPostId: shiftId,
        salonId: salon.id,
        groomerId,
        startsAt: shift.date,
        status: "CONFIRMED",
      },
    });
  });

  // Fetch groomer contact info for notifications
  const groomerProfile = await prisma.groomerProfile.findUnique({
    where: { id: groomerId },
    select: { fullName: true, userId: true },
  });

  const groomerUser = groomerProfile
    ? await prisma.user.findUnique({ where: { id: groomerProfile.userId }, select: { email: true } })
    : null;

  const salonUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true },
  });

  const shiftDate = shift.date.toISOString().split("T")[0];

  if (groomerUser?.email && groomerProfile) {
    notifyApplicationAccepted({
      groomerEmail: groomerUser.email,
      groomerName: groomerProfile.fullName,
      salonName: salon.name,
      salonAddress: salon.address,
      shiftDate,
      shiftTime: shift.startTime,
    }).catch((err) => console.error("Notification failed", err));
  }

  if (salonUser?.email) {
    notifyShiftFilled({
      salonEmail: salonUser.email,
      salonName: salon.name,
      groomerName: groomerProfile?.fullName ?? "Toiletteur(se)",
      shiftDate,
      shiftId,
    }).catch((err) => console.error("Notification failed", err));
  }

  // Notify rejected groomers (fire-and-forget)
  const rejectedApps = await prisma.application.findMany({
    where: { shiftPostId: shiftId, status: "REJECTED" },
    select: {
      groomer: {
        select: { fullName: true, user: { select: { email: true } } },
      },
    },
  });

  for (const app of rejectedApps) {
    if (app.groomer.user.email) {
      notifyApplicationRejected({
        groomerEmail: app.groomer.user.email,
        groomerName: app.groomer.fullName,
        salonName: salon.name,
        shiftDate,
        shiftCity: shift.city,
      }).catch((err) => console.error("Rejection notification failed", err));
    }
  }

  return NextResponse.json({ engagement }, { status: 200 });
}
