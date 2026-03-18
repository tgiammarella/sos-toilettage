import { prisma } from "@/lib/prisma";

/**
 * Recalculates and persists a groomer's reliability score.
 *
 * Formula (V1):
 *   reliabilityScore = (avgRating / 5 * 0.6) + (completionRate * 0.4)
 *
 * - avgRating: average of all review ratings received (0–5)
 * - completionRate: completed shifts / filled-or-completed shifts (0–1)
 *
 * Result is stored as a 0–5 scale for easy display alongside star ratings.
 */
export async function recalculateReliabilityScore(groomerId: string): Promise<number> {
  const [reviews, engagements] = await Promise.all([
    prisma.review.findMany({
      where: { subjectGroomerId: groomerId },
      select: { rating: true },
    }),
    prisma.engagement.findMany({
      where: { groomerId },
      select: {
        shiftPost: { select: { status: true } },
      },
    }),
  ]);

  // Average rating (0–5)
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  // Completion rate: COMPLETED / (FILLED + COMPLETED)
  const shiftEngagements = engagements.filter((e) => e.shiftPost != null);
  const total = shiftEngagements.filter(
    (e) => e.shiftPost!.status === "FILLED" || e.shiftPost!.status === "COMPLETED",
  ).length;
  const completed = shiftEngagements.filter(
    (e) => e.shiftPost!.status === "COMPLETED",
  ).length;
  const completionRate = total > 0 ? completed / total : 0;

  // Weighted score on 0–5 scale
  const score = (avgRating * 0.6) + (completionRate * 5 * 0.4);
  const rounded = Math.round(score * 100) / 100;

  await prisma.groomerProfile.update({
    where: { id: groomerId },
    data: { reliabilityScore: rounded },
  });

  return rounded;
}
