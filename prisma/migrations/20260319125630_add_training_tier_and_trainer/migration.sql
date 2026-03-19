-- AlterTable
ALTER TABLE "TrainingListing" ADD COLUMN     "isTrainer" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tier" TEXT NOT NULL DEFAULT 'GRATUIT';
