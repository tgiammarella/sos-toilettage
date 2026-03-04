import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notifyJobApplicationReceived } from "@/lib/notifications";

const ApplySchema = z.object({
  message: z.string().max(500).optional(),
  availabilityDates: z.string().max(200).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "GROOMER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: jobId } = await params;

  const groomer = await prisma.groomerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, fullName: true },
  });

  if (!groomer) {
    return NextResponse.json({ error: "Groomer profile not found" }, { status: 404 });
  }

  const job = await prisma.jobPost.findUnique({
    where: { id: jobId },
    include: { salon: { select: { id: true, name: true, userId: true } } },
  });

  if (!job || job.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Job not available" }, { status: 404 });
  }

  const existing = await prisma.application.findFirst({
    where: { jobPostId: jobId, groomerId: groomer.id },
  });

  if (existing) {
    return NextResponse.json({ error: "ALREADY_APPLIED" }, { status: 409 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const parsed = ApplySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", issues: parsed.error.flatten() }, { status: 422 });
  }

  const application = await prisma.application.create({
    data: {
      postType: "JOB",
      jobPostId: jobId,
      salonId: job.salon.id,
      groomerId: groomer.id,
      status: "APPLIED",
      message: parsed.data.message,
      availabilityDates: parsed.data.availabilityDates,
    },
  });

  const salonUser = await prisma.user.findUnique({
    where: { id: job.salon.userId },
    select: { email: true },
  });

  if (salonUser?.email) {
    try {
      await notifyJobApplicationReceived({
        salonEmail: salonUser.email,
        salonName: job.salon.name,
        groomerName: groomer.fullName,
        jobTitle: job.title,
        jobCity: job.city, // city exists on JobPost
      });
    } catch (err) {
      console.error("Notification failed", err);
    }
  }

  return NextResponse.json({ application }, { status: 201 });
}
