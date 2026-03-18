import { prisma } from "@/lib/prisma";

export interface MarketStats {
  totalGroomers: number;
  newGroomersThisWeek: number;
  /** Formatted string like "3,2 h" or "48 min", or "—" if no data. */
  avgTimeToFirstApplicant: string;
}

export async function getMarketStats(): Promise<MarketStats> {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [totalGroomers, newGroomersThisWeek] = await Promise.all([
    prisma.user.count({ where: { role: "GROOMER" } }),
    prisma.groomerProfile.count({ where: { createdAt: { gte: oneWeekAgo } } }),
  ]);

  // Compute average time between publishedAt and first application
  // TODO: Replace mocked fallback with live data once sufficient volume exists.
  const shiftsWithApps = await prisma.shiftPost.findMany({
    where: {
      publishedAt: { not: null },
      applications: { some: {} },
    },
    select: {
      publishedAt: true,
      applications: {
        orderBy: { createdAt: "asc" },
        take: 1,
        select: { createdAt: true },
      },
    },
    take: 200,
  });

  let avgTimeToFirstApplicant = "—";
  const deltas = shiftsWithApps
    .filter((s) => s.publishedAt && s.applications.length > 0)
    .map(
      (s) =>
        s.applications[0].createdAt.getTime() - s.publishedAt!.getTime(),
    );

  if (deltas.length > 0) {
    const avgMs = deltas.reduce((sum, d) => sum + d, 0) / deltas.length;
    const avgMin = avgMs / 60_000;
    if (avgMin < 60) {
      avgTimeToFirstApplicant = `${Math.round(avgMin)} min`;
    } else {
      const h = (avgMin / 60).toFixed(1).replace(".", ",");
      avgTimeToFirstApplicant = `${h} h`;
    }
  }

  return { totalGroomers, newGroomersThisWeek, avgTimeToFirstApplicant };
}
