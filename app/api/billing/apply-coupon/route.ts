import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PRICING_TIERS } from "@/lib/pricing";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * POST /api/billing/apply-coupon
 * Body: { code: string }
 * Requires: SALON session
 *
 * Entire validation + application runs inside a single Prisma transaction
 * to prevent TOCTOU race conditions on maxUses / alreadyUsed checks.
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

  const code = typeof (body as { code?: unknown }).code === "string"
    ? ((body as { code: string }).code).trim().toUpperCase()
    : null;

  if (!code) {
    return NextResponse.json({ error: "code required" }, { status: 422 });
  }

  const salonProfile = await prisma.salonProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, creditsAvailable: true },
  });
  if (!salonProfile) {
    return NextResponse.json({ error: "Salon not found" }, { status: 404 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // All reads and writes inside the transaction for atomicity
      const coupon = await tx.coupon.findUnique({ where: { code } });

      if (!coupon) {
        throw new CouponError("INVALID_CODE", 404);
      }
      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        throw new CouponError("EXPIRED", 410);
      }
      if (coupon.usedCount >= coupon.maxUses) {
        throw new CouponError("MAX_USES_REACHED", 409);
      }

      // Check if salon already used this coupon
      const alreadyUsed = await tx.couponUse.findUnique({
        where: { couponId_salonId: { couponId: coupon.id, salonId: salonProfile.id } },
      });
      if (alreadyUsed) {
        throw new CouponError("ALREADY_USED", 409);
      }

      // Atomically increment usedCount
      await tx.coupon.update({
        where: { id: coupon.id },
        data: { usedCount: { increment: 1 } },
      });

      await tx.couponUse.create({
        data: { couponId: coupon.id, salonId: salonProfile.id },
      });

      let creditsAvailable = salonProfile.creditsAvailable;

      // Apply credit bonus
      if (coupon.credits > 0) {
        creditsAvailable += coupon.credits;
        await tx.salonProfile.update({
          where: { id: salonProfile.id },
          data: { creditsAvailable: { increment: coupon.credits } },
        });
        await tx.creditLedger.create({
          data: {
            salonId: salonProfile.id,
            type: "CREDIT",
            amount: coupon.credits,
            reason: `COUPON:${coupon.code}`,
          },
        });
      }

      // Apply plan upgrade
      let planKey: string | null = null;
      let creditsMonthlyAllowance: number | null = null;
      if (coupon.planKey) {
        const tier = PRICING_TIERS.find((t) => t.key === coupon.planKey);
        if (tier) {
          planKey = tier.key;
          creditsMonthlyAllowance = tier.creditsPerMonth;
          const nextRenewalAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          const delta = Math.max(0, tier.creditsPerMonth - creditsAvailable);
          creditsAvailable = Math.max(creditsAvailable, tier.creditsPerMonth);

          await tx.salonProfile.update({
            where: { id: salonProfile.id },
            data: {
              planKey: tier.key,
              creditsMonthlyAllowance: tier.creditsPerMonth,
              creditsAvailable,
              nextRenewalAt,
            },
          });

          if (delta > 0) {
            await tx.creditLedger.create({
              data: {
                salonId: salonProfile.id,
                type: "CREDIT",
                amount: delta,
                reason: `COUPON_PLAN:${coupon.code}:${tier.key}`,
              },
            });
          }
        }
      } else if (coupon.credits > 0) {
        const fresh = await tx.salonProfile.findUnique({
          where: { id: salonProfile.id },
          select: { creditsAvailable: true },
        });
        creditsAvailable = fresh?.creditsAvailable ?? creditsAvailable;
      }

      return { creditsAvailable, planKey, creditsMonthlyAllowance };
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    if (err instanceof CouponError) {
      return NextResponse.json({ error: err.code }, { status: err.httpStatus });
    }
    throw err;
  }
}

class CouponError extends Error {
  constructor(public code: string, public httpStatus: number) {
    super(code);
  }
}
