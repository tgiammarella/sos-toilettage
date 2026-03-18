import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notifyJobApplicationRejected } from "@/lib/notifications";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; applicationId: string }> }
) {
  const limited = await checkRateLimit(req, "moderate");
  if (limited) return limited;

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
    select: { id: true, salonId: true, status: true, title: true, city: true },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  if (job.salonId !== salon.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { id: true, jobPostId: true, status: true, groomerId: true },
  });

  if (!application || application.jobPostId !== jobId) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  if (application.status !== "APPLIED") {
    return NextResponse.json(
      { error: "Application is not in APPLIED state", current: application.status },
      { status: 409 }
    );
  }

  const updated = await prisma.application.update({
    where: { id: applicationId },
    data: { status: "REJECTED" },
    select: { id: true, status: true },
  });

  // Notify rejected groomer
  const groomer = await prisma.groomerProfile.findUnique({
    where: { id: application.groomerId },
    select: { fullName: true, user: { select: { email: true } } },
  });

  if (groomer?.user.email) {
    notifyJobApplicationRejected({
      groomerEmail: groomer.user.email,
      groomerName: groomer.fullName,
      salonName: salon.name,
      jobTitle: job.title,
      jobCity: job.city,
    }).catch((err) => console.error("Rejection notification failed", err));
  }

  return NextResponse.json({ application: updated }, { status: 200 });
}
