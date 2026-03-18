-- Add new fields to TrainingListing
ALTER TABLE "TrainingListing" ADD COLUMN "province" TEXT NOT NULL DEFAULT '';
ALTER TABLE "TrainingListing" ADD COLUMN "logoUrl" TEXT;
ALTER TABLE "TrainingListing" ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT 0;

-- Migrate existing TRAINING type to COURSE
UPDATE "TrainingListing" SET "type" = 'COURSE' WHERE "type" = 'TRAINING';
