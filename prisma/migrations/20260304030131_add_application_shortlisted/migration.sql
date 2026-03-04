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
    CONSTRAINT "Application_shiftPostId_fkey" FOREIGN KEY ("shiftPostId") REFERENCES "ShiftPost" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Application_jobPostId_fkey" FOREIGN KEY ("jobPostId") REFERENCES "JobPost" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Application_groomerId_fkey" FOREIGN KEY ("groomerId") REFERENCES "GroomerProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Application" ("availabilityDates", "createdAt", "groomerId", "id", "jobPostId", "message", "postType", "salonId", "shiftPostId", "status", "updatedAt") SELECT "availabilityDates", "createdAt", "groomerId", "id", "jobPostId", "message", "postType", "salonId", "shiftPostId", "status", "updatedAt" FROM "Application";
DROP TABLE "Application";
ALTER TABLE "new_Application" RENAME TO "Application";
CREATE INDEX "Application_shiftPostId_status_idx" ON "Application"("shiftPostId", "status");
CREATE INDEX "Application_jobPostId_status_idx" ON "Application"("jobPostId", "status");
CREATE INDEX "Application_groomerId_idx" ON "Application"("groomerId");
CREATE INDEX "Application_salonId_groomerId_idx" ON "Application"("salonId", "groomerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
