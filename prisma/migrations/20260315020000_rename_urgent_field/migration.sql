-- AlterTable: rename urgentPurchasedAt to urgentActivatedAt
ALTER TABLE "ShiftPost" RENAME COLUMN "urgentPurchasedAt" TO "urgentActivatedAt";
