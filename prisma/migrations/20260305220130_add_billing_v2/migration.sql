-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "credits" INTEGER NOT NULL DEFAULT 0,
    "planKey" TEXT,
    "maxUses" INTEGER NOT NULL DEFAULT 1,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "CouponUse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "couponId" TEXT NOT NULL,
    "salonId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CouponUse_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CouponUse_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "SalonProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SalonProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "phone" TEXT,
    "website" TEXT,
    "description" TEXT,
    "stripeCustomerId" TEXT,
    "subscriptionPlan" TEXT NOT NULL DEFAULT 'NONE',
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'INACTIVE',
    "subscriptionId" TEXT,
    "creditsAvailable" INTEGER NOT NULL DEFAULT 0,
    "creditsMonthlyAllowance" INTEGER NOT NULL DEFAULT 0,
    "planKey" TEXT NOT NULL DEFAULT 'NONE',
    "nextRenewalAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SalonProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SalonProfile" ("address", "city", "createdAt", "creditsAvailable", "creditsMonthlyAllowance", "description", "id", "name", "phone", "postalCode", "region", "stripeCustomerId", "subscriptionId", "subscriptionPlan", "subscriptionStatus", "updatedAt", "userId", "website") SELECT "address", "city", "createdAt", "creditsAvailable", "creditsMonthlyAllowance", "description", "id", "name", "phone", "postalCode", "region", "stripeCustomerId", "subscriptionId", "subscriptionPlan", "subscriptionStatus", "updatedAt", "userId", "website" FROM "SalonProfile";
DROP TABLE "SalonProfile";
ALTER TABLE "new_SalonProfile" RENAME TO "SalonProfile";
CREATE UNIQUE INDEX "SalonProfile_userId_key" ON "SalonProfile"("userId");
CREATE UNIQUE INDEX "SalonProfile_stripeCustomerId_key" ON "SalonProfile"("stripeCustomerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CouponUse_couponId_salonId_key" ON "CouponUse"("couponId", "salonId");
