-- RenameColumn: Partner.region → Partner.province (preserves data)
ALTER TABLE "Partner" RENAME COLUMN "region" TO "province";
ALTER TABLE "Partner" ALTER COLUMN "province" SET DEFAULT 'QC';

-- Backfill empty province values with QC
UPDATE "Partner" SET "province" = 'QC' WHERE "province" = '' OR "province" IS NULL;
