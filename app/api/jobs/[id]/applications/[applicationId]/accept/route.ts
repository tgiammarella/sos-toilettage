import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notifyJobApplicationAccepted, notifyJobFilled } from "@/lib/notifications";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; applicationId: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "SALON") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: jobId, applicationId } = await params;

  const salon = await prisma.salonProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, name: true },
  });

  if (!salon) {
    return NextResponse.json({ error: "Salon profile not found" }, { status: 404 });
  }

  const job = await prisma.jobPost.findUnique({
    where: { id: jobId },
    select: { id: true, salonId: true, status: true, title: true },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  if (job.salonId !== salon.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (job.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Job is not open for acceptance" }, { status: 409 });
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { id: true, groomerId: true, jobPostId: true, status: true },
  });

  if (!application || application.jobPostId !== jobId || application.status !== "APPLIED") {
    return NextResponse.json({ error: "Application not found or not in APPLIED state" }, { status: 404 });
  }

  // Accept target, reject all other APPLIED applications, fill job, create engagement — atomically
  const engagement = await prisma.$transaction(async (tx) => {
    await tx.application.update({
      where: { id: applicationId },
      data: { status: "ACCEPTED" },
    });

    // Reject every other pending application for this job
    await tx.application.updateMany({
      where: {
        jobPostId: jobId,
        status: "APPLIED",
        id: { not: applicationId },
      },
      data: { status: "REJECTED" },
    });

    await tx.jobPost.update({
      where: { id: jobId },
      data: { status: "FILLED" },
    });

    return tx.engagement.create({
      data: {
        jobPostId: jobId,
        salonId: salon.id,
        groomerId: application.groomerId,
        startsAt: new Date(),
        status: "CONFIRMED",
      },
    });
  });

  const groomerProfile = await prisma.groomerProfile.findUnique({
    where: { id: application.groomerId },
    select: { fullName: true, userId: true },
  });

  const [groomerUser, salonUser] = await Promise.all([
    groomerProfile
      ? prisma.user.findUnique({ where: { id: groomerProfile.userId }, select: { email: true } })
      : null,
    prisma.user.findUnique({ where: { id: session.user.id }, select: { email: true } }),
  ]);

  if (groomerUser?.email && groomerProfile) {
    try {
      await notifyJobApplicationAccepted({
        groomerEmail: groomerUser.email,
        groomerName: groomerProfile.fullName,
        salonName: salon.name,
        jobTitle: job.title,
      });
    } catch (err) {
      console.error("Notification failed", err);
    }
  }

  if (salonUser?.email) {
    try {
      await notifyJobFilled({
        salonEmail: salonUser.email,
        salonName: salon.name,
        groomerName: groomerProfile?.fullName ?? "Toiletteur(se)",
        jobTitle: job.title,
      });
    } catch (err) {
      console.error("Notification failed", err);
    }
  }

  return NextResponse.json({ engagement }, { status: 200 });
}
