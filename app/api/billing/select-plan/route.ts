import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PRICING_TIERS } from "@/lib/pricing";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * POST /api/billing/select-plan
 * Body: { planKey: string }
 * Requires: SALON session
 *
 * Credit policy on plan selection:
 *   creditsAvailable = max(currentCredits, planAllowance)
 *   i.e. we top up to the allowance if below, but never remove existing credits.
 *   A CreditLedger CREDIT entry is written only when a top-up occurs (delta > 0).
 *   nextRenewalAt is set to now + 30 days.
 */
export async function POST(req: NextRequest) {
  const limited = await checkRateLimit(req, "moderate");
  if (limited) return limited;

  const session = await auth();
  if (!session || session.user.role !== "SALON") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { planKey } = body as { planKey?: string };
  if (!planKey) {
    return NextResponse.json({ error: "planKey required" }, { status: 422 });
  }

  const tier = PRICING_TIERS.find((t) => t.key === planKey);
  if (!tier) {
    return NextResponse.json({ error: "Invalid planKey" }, { status: 422 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const salon = await tx.salonProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, creditsAvailable: true },
    });
    if (!salon) throw new Error("Salon not found");

    const allowance = tier.creditsPerMonth;
    const delta = Math.max(0, allowance - salon.creditsAvailable);
    const newCredits = Math.max(salon.creditsAvailable, allowance);
    const nextRenewalAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const updated = await tx.salonProfile.update({
      where: { id: salon.id },
      data: {
        planKey,
        creditsMonthlyAllowance: allowance,
        creditsAvailable: newCredits,
        nextRenewalAt,
      },
      select: { creditsAvailable: true, planKey: true, creditsMonthlyAllowance: true, nextRenewalAt: true },
    });

    // Only write ledger entry when credits are actually added
    if (delta > 0) {
      await tx.creditLedger.create({
        data: {
          salonId: salon.id,
          type: "CREDIT",
          amount: delta,
          reason: `PLAN_SELECTED:${planKey}`,
        },
      });
    }

    return updated;
  });

  return NextResponse.json(result, { status: 200 });
}
