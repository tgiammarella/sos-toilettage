import { prisma } from "@/lib/prisma";

function since(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

// ── Marketplace Health ────────────────────────────────────────────────────────

export interface MarketplaceHealth {
  shiftsPosted: number;
  jobsPosted: number;
  applications: number;
  fillRate: number; // 0–100
  medianFirstApplicant: string; // "2,4 h" | "48 min" | "—"
}

export async function getMarketplaceHealth(days: number): Promise<MarketplaceHealth> {
  const cutoff = since(days);

  const [shiftsPosted, jobsPosted, applications, shiftsFilled] = await Promise.all([
    prisma.shiftPost.count({ where: { publishedAt: { gte: cutoff } } }),
    prisma.jobPost.count({ where: { publishedAt: { gte: cutoff } } }),
    prisma.application.count({ where: { createdAt: { gte: cutoff } } }),
    prisma.shiftPost.count({ where: { status: "FILLED", filledAt: { gte: cutoff } } }),
  ]);

  const fillRate = shiftsPosted > 0 ? Math.round((shiftsFilled / shiftsPosted) * 100) : 0;

  // Median time from publishedAt to first application
  const shiftsWithApps = await prisma.shiftPost.findMany({
    where: { publishedAt: { gte: cutoff, not: null }, applications: { some: {} } },
    select: {
      publishedAt: true,
      applications: { orderBy: { createdAt: "asc" }, take: 1, select: { createdAt: true } },
    },
    take: 500,
  });

  const deltas = shiftsWithApps
    .filter((s) => s.publishedAt && s.applications.length > 0)
    .map((s) => s.applications[0].createdAt.getTime() - s.publishedAt!.getTime())
    .sort((a, b) => a - b);

  let medianFirstApplicant = "—";
  if (deltas.length > 0) {
    const mid = Math.floor(deltas.length / 2);
    const medianMs = deltas.length % 2 !== 0 ? deltas[mid] : (deltas[mid - 1] + deltas[mid]) / 2;
    const min = medianMs / 60_000;
    medianFirstApplicant = min < 60
      ? `${Math.round(min)} min`
      : `${(min / 60).toFixed(1).replace(".", ",")} h`;
  }

  return { shiftsPosted, jobsPosted, applications, fillRate, medianFirstApplicant };
}

// ── Funnel ────────────────────────────────────────────────────────────────────

export interface FunnelStats {
  newGroomers: number;
  newSalons: number;
  activatedGroomers: number; // has applied at least once
  activatedSalons: number;   // has posted at least once
}

export async function getFunnelStats(days: number): Promise<FunnelStats> {
  const cutoff = since(days);

  const [newGroomers, newSalons, activatedGroomers, activatedSalons] = await Promise.all([
    prisma.groomerProfile.count({ where: { createdAt: { gte: cutoff } } }),
    prisma.salonProfile.count({ where: { createdAt: { gte: cutoff } } }),
    prisma.groomerProfile.count({ where: { applications: { some: {} } } }),
    prisma.salonProfile.count({
      where: { OR: [{ shiftPosts: { some: {} } }, { jobPosts: { some: {} } }] },
    }),
  ]);

  return { newGroomers, newSalons, activatedGroomers, activatedSalons };
}

// ── Credits ───────────────────────────────────────────────────────────────────

export interface CreditStats {
  consumed: number;
  topSalons: { name: string; credits: number }[];
}

export async function getCreditStats(days: number): Promise<CreditStats> {
  const cutoff = since(days);

  const [debitAgg, salons] = await Promise.all([
    prisma.creditLedger.aggregate({
      where: { type: "DEBIT", createdAt: { gte: cutoff } },
      _sum: { amount: true },
    }),
    prisma.salonProfile.findMany({
      select: {
        name: true,
        creditLedger: {
          where: { type: "DEBIT", createdAt: { gte: cutoff } },
          select: { amount: true },
        },
      },
    }),
  ]);

  const consumed = Math.abs(debitAgg._sum.amount ?? 0);

  const topSalons = salons
    .map((s) => ({
      name: s.name,
      credits: Math.abs(s.creditLedger.reduce((sum, l) => sum + l.amount, 0)),
    }))
    .filter((s) => s.credits > 0)
    .sort((a, b) => b.credits - a.credits)
    .slice(0, 5);

  return { consumed, topSalons };
}
