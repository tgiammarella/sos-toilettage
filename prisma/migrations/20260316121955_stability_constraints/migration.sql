-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Application" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postType" TEXT NOT NULL,
    "shiftPostId" TEXT,
    "jobPostId" TEXT,
    "salonId" TEXT NOT NULL,
    "groomerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'APPLIED',
    "shortlisted" BOOLEAN NOT NULL DEFAULT false,
    "message" TEXT,
    "availabilityDates" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Application_shiftPostId_fkey" FOREIGN KEY ("shiftPostId") REFERENCES "ShiftPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Application_jobPostId_fkey" FOREIGN KEY ("jobPostId") REFERENCES "JobPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Application_groomerId_fkey" FOREIGN KEY ("groomerId") REFERENCES "GroomerProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Application" ("availabilityDates", "createdAt", "groomerId", "id", "jobPostId", "message", "postType", "salonId", "shiftPostId", "shortlisted", "status", "updatedAt") SELECT "availabilityDates", "createdAt", "groomerId", "id", "jobPostId", "message", "postType", "salonId", "shiftPostId", "shortlisted", "status", "updatedAt" FROM "Application";
DROP TABLE "Application";
ALTER TABLE "new_Application" RENAME TO "Application";
CREATE INDEX "Application_shiftPostId_status_idx" ON "Application"("shiftPostId", "status");
CREATE INDEX "Application_jobPostId_status_idx" ON "Application"("jobPostId", "status");
CREATE INDEX "Application_groomerId_idx" ON "Application"("groomerId");
CREATE INDEX "Application_salonId_groomerId_idx" ON "Application"("salonId", "groomerId");
CREATE UNIQUE INDEX "Application_shiftPostId_groomerId_key" ON "Application"("shiftPostId", "groomerId");
CREATE UNIQUE INDEX "Application_jobPostId_groomerId_key" ON "Application"("jobPostId", "groomerId");
CREATE TABLE "new_CreditLedger" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "salonId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "shiftId" TEXT,
    "stripeEventId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CreditLedger_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "SalonProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CreditLedger_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "ShiftPost" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CreditLedger" ("amount", "createdAt", "id", "reason", "salonId", "shiftId", "stripeEventId", "type") SELECT "amount", "createdAt", "id", "reason", "salonId", "shiftId", "stripeEventId", "type" FROM "CreditLedger";
DROP TABLE "CreditLedger";
ALTER TABLE "new_CreditLedger" RENAME TO "CreditLedger";
CREATE UNIQUE INDEX "CreditLedger_stripeEventId_key" ON "CreditLedger"("stripeEventId");
CREATE INDEX "CreditLedger_salonId_createdAt_idx" ON "CreditLedger"("salonId", "createdAt");
CREATE TABLE "new_Engagement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shiftPostId" TEXT,
    "jobPostId" TEXT,
    "salonId" TEXT NOT NULL,
    "groomerId" TEXT NOT NULL,
    "startsAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Engagement_shiftPostId_fkey" FOREIGN KEY ("shiftPostId") REFERENCES "ShiftPost" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Engagement_jobPostId_fkey" FOREIGN KEY ("jobPostId") REFERENCES "JobPost" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Engagement_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "SalonProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Engagement_groomerId_fkey" FOREIGN KEY ("groomerId") REFERENCES "GroomerProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Engagement" ("createdAt", "groomerId", "id", "jobPostId", "salonId", "shiftPostId", "startsAt", "status", "updatedAt") SELECT "createdAt", "groomerId", "id", "jobPostId", "salonId", "shiftPostId", "startsAt", "status", "updatedAt" FROM "Engagement";
DROP TABLE "Engagement";
ALTER TABLE "new_Engagement" RENAME TO "Engagement";
CREATE UNIQUE INDEX "Engagement_shiftPostId_key" ON "Engagement"("shiftPostId");
CREATE UNIQUE INDEX "Engagement_jobPostId_key" ON "Engagement"("jobPostId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
