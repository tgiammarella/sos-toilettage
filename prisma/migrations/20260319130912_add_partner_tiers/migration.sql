-- AlterTable
ALTER TABLE "Partner" ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "launchPricing" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lockedMonthlyRate" INTEGER,
ADD COLUMN     "memberDiscountPercent" INTEGER,
ADD COLUMN     "tier" TEXT NOT NULL DEFAULT 'DECOUVERTE';
