import { prisma } from "@/lib/prisma";

/**
 * Atomically deduct 1 credit from a salon and record the ledger entry.
 * Returns the updated creditsAvailable, or throws if insufficient credits.
 */
export async function deductCredit(salonId: string, shiftId: string): Promise<number> {
  return prisma.$transaction(async (tx) => {
    const salon = await tx.salonProfile.findUnique({
      where: { id: salonId },
      select: { creditsAvailable: true },
    });

    if (!salon) throw new Error("Salon not found");
    if (salon.creditsAvailable < 1) throw new Error("INSUFFICIENT_CREDITS");

    const updated = await tx.salonProfile.update({
      where: { id: salonId },
      data: { creditsAvailable: { decrement: 1 } },
      select: { creditsAvailable: true },
    });

    await tx.creditLedger.create({
      data: {
        salonId,
        type: "DEBIT",
        amount: -1,
        reason: "SHIFT_PUBLISHED",
        shiftId,
      },
    });

    return updated.creditsAvailable;
  });
}

/**
 * Add credits to a salon (credit pack purchase or admin grant).
 * reason: e.g. "PACK_PURCHASE", "MONTHLY_GRANT", "ADMIN_ADJUSTMENT"
 */
export async function addCredits(
  salonId: string,
  amount: number,
  reason: string
): Promise<number> {
  return prisma.$transaction(async (tx) => {
    const updated = await tx.salonProfile.update({
      where: { id: salonId },
      data: { creditsAvailable: { increment: amount } },
      select: { creditsAvailable: true },
    });

    await tx.creditLedger.create({
      data: {
        salonId,
        type: "CREDIT",
        amount,
        reason,
      },
    });

    return updated.creditsAvailable;
  });
}

/**
 * Grant the monthly subscription credit allowance to a salon.
 * Intended to be called by a cron job or Stripe webhook on renewal.
 */
export async function grantMonthlyCredits(salonId: string): Promise<number> {
  const salon = await prisma.salonProfile.findUnique({
    where: { id: salonId },
    select: { creditsMonthlyAllowance: true },
  });

  if (!salon || salon.creditsMonthlyAllowance === 0) return 0;

  return addCredits(salonId, salon.creditsMonthlyAllowance, "MONTHLY_GRANT");
}
