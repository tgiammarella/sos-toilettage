import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { recalculateReliabilityScore } from "@/lib/reliability";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const limited = await checkRateLimit(req, "moderate");
  if (limited) return limited;

  const session = await auth();
  if (!session || session.user.role !== "SALON") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { engagementId, rating, text } = body as {
    engagementId: string;
    rating: number;
    text?: string;
  };

  if (!engagementId || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const engagement = await prisma.engagement.findUnique({
    where: { id: engagementId },
    include: {
      salon: { select: { id: true, userId: true } },
      groomer: { select: { id: true, userId: true } },
      shiftPost: { select: { status: true } },
    },
  });

  if (!engagement) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (engagement.salon.userId !== session.user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // Reviews only allowed after shift is marked COMPLETED
  if (engagement.shiftPost && engagement.shiftPost.status !== "COMPLETED") {
    return NextResponse.json(
      { error: "SHIFT_NOT_COMPLETED", message: "Le remplacement doit être complété avant de laisser un avis." },
      { status: 409 },
    );
  }

  try {
    const review = await prisma.review.create({
      data: {
        engagementId,
        reviewerUserId: session.user.id,
        reviewerRole: "SALON",
        reviewerSalonId: engagement.salonId,
        subjectUserId: engagement.groomer.userId,
        subjectRole: "GROOMER",
        subjectGroomerId: engagement.groomerId,
        rating,
        text: text?.trim() || null,
      },
    });
    // Recalculate reliability score (fire-and-forget)
    recalculateReliabilityScore(engagement.groomerId).catch((err) =>
      console.error("[RELIABILITY] Recalc failed", err),
    );

    return NextResponse.json({ review }, { status: 201 });
  } catch (e: unknown) {
    if ((e as { code?: string })?.code === "P2002") {
      return NextResponse.json({ error: "already_reviewed" }, { status: 409 });
    }
    throw e;
  }
}
