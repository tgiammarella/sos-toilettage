-- Add paid job posting fields
ALTER TABLE "JobPost" ADD COLUMN "expiresAt" DATETIME;
ALTER TABLE "JobPost" ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT 0;
ALTER TABLE "JobPost" ADD COLUMN "paidAt" DATETIME;
