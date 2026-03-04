/*
  Warnings:

  - You are about to drop the column `cvUrl` on the `GroomerProfile` table. All the data in the column will be lost.

*/
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GroomerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_GroomerProfile" ("bio", "certifications", "city", "createdAt", "fullName", "id", "photoUrl", "portfolioUrls", "region", "specializations", "updatedAt", "userId", "yearsExperience") SELECT "bio", "certifications", "city", "createdAt", "fullName", "id", "photoUrl", "portfolioUrls", "region", "specializations", "updatedAt", "userId", "yearsExperience" FROM "GroomerProfile";
DROP TABLE "GroomerProfile";
ALTER TABLE "new_GroomerProfile" RENAME TO "GroomerProfile";
CREATE UNIQUE INDEX "GroomerProfile_userId_key" ON "GroomerProfile"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
