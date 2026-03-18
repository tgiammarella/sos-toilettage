import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { JOB_POSTING } from "@/lib/pricing";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const limited = await checkRateLimit(req, "moderate");
  if (limited) return limited;

  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: Replace admin gate with Stripe payment verification when Stripe is wired
  if (session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Payment required. Job posting requires a $49 CAD payment. Stripe integration coming soon." },
      { status: 402 },
    );
  }

  const { id } = await params;

  const job = await prisma.jobPost.findUnique({
    where: { id },
    select: { id: true, salonId: true, status: true },
  });

  if (!job) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (job.status !== "DRAFT") {
    return NextResponse.json(
      { error: "INVALID_STATUS", message: "Seul un brouillon peut être publié." },
      { status: 409 },
    );
  }

  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + JOB_POSTING.durationDays);

  const updated = await prisma.jobPost.update({
    where: { id },
    data: {
      status: "PUBLISHED",
      publishedAt: now,
      paidAt: now,
      expiresAt,
    },
  });

  return NextResponse.json({
    job: { id: updated.id, status: updated.status, expiresAt: updated.expiresAt },
  });
}
