-- CreateTable
CREATE TABLE "ShiftInvite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shiftId" TEXT NOT NULL,
    "groomerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ShiftInvite_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "ShiftPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ShiftInvite_groomerId_fkey" FOREIGN KEY ("groomerId") REFERENCES "GroomerProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GroomerProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "photoUrl" TEXT,
    "city" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "yearsExperience" INTEGER NOT NULL DEFAULT 0,
    "specializations" TEXT NOT NULL DEFAULT '[]',
    "certifications" TEXT NOT NULL DEFAULT '[]',
    "portfolioUrls" TEXT NOT NULL DEFAULT '[]',
    "cvFileUrl" TEXT,
    "bio" TEXT,
    "availableToday" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GroomerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_GroomerProfile" ("bio", "certifications", "city", "createdAt", "cvFileUrl", "fullName", "id", "photoUrl", "portfolioUrls", "region", "specializations", "updatedAt", "userId", "yearsExperience") SELECT "bio", "certifications", "city", "createdAt", "cvFileUrl", "fullName", "id", "photoUrl", "portfolioUrls", "region", "specializations", "updatedAt", "userId", "yearsExperience" FROM "GroomerProfile";
DROP TABLE "GroomerProfile";
ALTER TABLE "new_GroomerProfile" RENAME TO "GroomerProfile";
CREATE UNIQUE INDEX "GroomerProfile_userId_key" ON "GroomerProfile"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ShiftInvite_groomerId_idx" ON "ShiftInvite"("groomerId");

-- CreateIndex
CREATE UNIQUE INDEX "ShiftInvite_shiftId_groomerId_key" ON "ShiftInvite"("shiftId", "groomerId");
