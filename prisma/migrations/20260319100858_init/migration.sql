-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'SALON', 'GROOMER');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('NONE', 'BASIC', 'PRO');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PAST_DUE', 'CANCELED');

-- CreateEnum
CREATE TYPE "ShiftStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'FILLED', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'FILLED', 'EXPIRED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('APPLIED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('SHIFT', 'JOB');

-- CreateEnum
CREATE TYPE "PayType" AS ENUM ('HOURLY', 'FLAT');

-- CreateEnum
CREATE TYPE "CreditType" AS ENUM ('CREDIT', 'DEBIT');

-- CreateEnum
CREATE TYPE "TrainingType" AS ENUM ('SCHOOL', 'COURSE', 'WORKSHOP', 'CERTIFICATION');

-- CreateEnum
CREATE TYPE "EngagementStatus" AS ENUM ('CONFIRMED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT');

-- CreateEnum
CREATE TYPE "ModerationActionType" AS ENUM ('BAN', 'UNBAN', 'SUSPEND', 'REACTIVATE', 'BLOCK_EMAIL', 'UNBLOCK_EMAIL');

-- CreateEnum
CREATE TYPE "OpenSlotStatus" AS ENUM ('ACTIVE', 'FILLED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "OpenSlotService" AS ENUM ('BAIN_COUPE', 'BAIN_SEULEMENT', 'COUPE_SEULEMENT', 'TOILETTAGE_COMPLET', 'AUTRE');

-- CreateEnum
CREATE TYPE "DogSize" AS ENUM ('TRES_PETIT', 'PETIT', 'MOYEN', 'GRAND', 'TRES_GRAND');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "passwordHash" TEXT,
    "role" "Role" NOT NULL DEFAULT 'GROOMER',
    "verifyToken" TEXT,
    "verifyTokenExpiry" TIMESTAMP(3),
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "bannedAt" TIMESTAMP(3),
    "bannedReason" TEXT,
    "bannedNotes" TEXT,
    "bannedByUserId" TEXT,
    "isSuspended" BOOLEAN NOT NULL DEFAULT false,
    "suspendedAt" TIMESTAMP(3),
    "suspensionEndsAt" TIMESTAMP(3),
    "suspendedReason" TEXT,
    "suspendedNotes" TEXT,
    "suspendedByUserId" TEXT,
    "moderationEmailBlocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "SalonProfile" (
    "id" TEXT NOT NULL,
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
    "subscriptionPlan" "SubscriptionPlan" NOT NULL DEFAULT 'NONE',
    "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'INACTIVE',
    "subscriptionId" TEXT,
    "creditsAvailable" INTEGER NOT NULL DEFAULT 0,
    "creditsMonthlyAllowance" INTEGER NOT NULL DEFAULT 0,
    "planKey" TEXT NOT NULL DEFAULT 'NONE',
    "nextRenewalAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalonProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroomerProfile" (
    "id" TEXT NOT NULL,
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
    "reliabilityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroomerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShiftPost" (
    "id" TEXT NOT NULL,
    "salonId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "numberOfAppointments" INTEGER NOT NULL,
    "payType" "PayType" NOT NULL,
    "payRateCents" INTEGER NOT NULL,
    "requiredExperienceYears" INTEGER NOT NULL DEFAULT 0,
    "criteriaTags" TEXT NOT NULL DEFAULT '[]',
    "equipmentProvided" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "isUrgent" BOOLEAN NOT NULL DEFAULT false,
    "urgentActivatedAt" TIMESTAMP(3),
    "status" "ShiftStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "filledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShiftPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobPost" (
    "id" TEXT NOT NULL,
    "salonId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "employmentType" "EmploymentType" NOT NULL,
    "city" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "payInfo" TEXT,
    "requirements" TEXT,
    "status" "JobStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "postType" "PostType" NOT NULL,
    "shiftPostId" TEXT,
    "jobPostId" TEXT,
    "salonId" TEXT NOT NULL,
    "groomerId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'APPLIED',
    "shortlisted" BOOLEAN NOT NULL DEFAULT false,
    "message" TEXT,
    "availabilityDates" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Engagement" (
    "id" TEXT NOT NULL,
    "shiftPostId" TEXT,
    "jobPostId" TEXT,
    "salonId" TEXT NOT NULL,
    "groomerId" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "status" "EngagementStatus" NOT NULL DEFAULT 'CONFIRMED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Engagement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "reviewerUserId" TEXT NOT NULL,
    "reviewerRole" "Role" NOT NULL,
    "reviewerSalonId" TEXT,
    "reviewerGroomerId" TEXT,
    "subjectUserId" TEXT NOT NULL,
    "subjectRole" "Role" NOT NULL,
    "subjectSalonId" TEXT,
    "subjectGroomerId" TEXT,
    "rating" INTEGER NOT NULL,
    "text" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShiftInvite" (
    "id" TEXT NOT NULL,
    "shiftId" TEXT NOT NULL,
    "groomerId" TEXT NOT NULL,
    "status" "InviteStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShiftInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditLedger" (
    "id" TEXT NOT NULL,
    "salonId" TEXT NOT NULL,
    "type" "CreditType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "shiftId" TEXT,
    "stripeEventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "credits" INTEGER NOT NULL DEFAULT 0,
    "planKey" TEXT,
    "maxUses" INTEGER NOT NULL DEFAULT 1,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CouponUse" (
    "id" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "salonId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CouponUse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminModerationAction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "actionType" "ModerationActionType" NOT NULL,
    "reason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveUntil" TIMESTAMP(3),

    CONSTRAINT "AdminModerationAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpenSlot" (
    "id" TEXT NOT NULL,
    "salonId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "serviceType" "OpenSlotService" NOT NULL,
    "dogSize" "DogSize",
    "price" DOUBLE PRECISION,
    "notes" TEXT,
    "status" "OpenSlotStatus" NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpenSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingListing" (
    "id" TEXT NOT NULL,
    "type" "TrainingType" NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL DEFAULT '',
    "region" TEXT NOT NULL,
    "websiteUrl" TEXT,
    "logoUrl" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "description" TEXT,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingListing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_verifyToken_key" ON "User"("verifyToken");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "SalonProfile_userId_key" ON "SalonProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SalonProfile_stripeCustomerId_key" ON "SalonProfile"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "GroomerProfile_userId_key" ON "GroomerProfile"("userId");

-- CreateIndex
CREATE INDEX "ShiftPost_date_city_region_status_idx" ON "ShiftPost"("date", "city", "region", "status");

-- CreateIndex
CREATE INDEX "JobPost_city_region_status_idx" ON "JobPost"("city", "region", "status");

-- CreateIndex
CREATE INDEX "Application_shiftPostId_status_idx" ON "Application"("shiftPostId", "status");

-- CreateIndex
CREATE INDEX "Application_jobPostId_status_idx" ON "Application"("jobPostId", "status");

-- CreateIndex
CREATE INDEX "Application_groomerId_idx" ON "Application"("groomerId");

-- CreateIndex
CREATE INDEX "Application_salonId_groomerId_idx" ON "Application"("salonId", "groomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Application_shiftPostId_groomerId_key" ON "Application"("shiftPostId", "groomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Application_jobPostId_groomerId_key" ON "Application"("jobPostId", "groomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Engagement_shiftPostId_key" ON "Engagement"("shiftPostId");

-- CreateIndex
CREATE UNIQUE INDEX "Engagement_jobPostId_key" ON "Engagement"("jobPostId");

-- CreateIndex
CREATE INDEX "Review_subjectUserId_idx" ON "Review"("subjectUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_engagementId_reviewerUserId_key" ON "Review"("engagementId", "reviewerUserId");

-- CreateIndex
CREATE INDEX "ShiftInvite_groomerId_idx" ON "ShiftInvite"("groomerId");

-- CreateIndex
CREATE UNIQUE INDEX "ShiftInvite_shiftId_groomerId_key" ON "ShiftInvite"("shiftId", "groomerId");

-- CreateIndex
CREATE UNIQUE INDEX "CreditLedger_stripeEventId_key" ON "CreditLedger"("stripeEventId");

-- CreateIndex
CREATE INDEX "CreditLedger_salonId_createdAt_idx" ON "CreditLedger"("salonId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CouponUse_couponId_salonId_key" ON "CouponUse"("couponId", "salonId");

-- CreateIndex
CREATE INDEX "AdminModerationAction_userId_createdAt_idx" ON "AdminModerationAction"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "OpenSlot_status_expiresAt_idx" ON "OpenSlot"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "OpenSlot_salonId_status_idx" ON "OpenSlot"("salonId", "status");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalonProfile" ADD CONSTRAINT "SalonProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroomerProfile" ADD CONSTRAINT "GroomerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftPost" ADD CONSTRAINT "ShiftPost_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "SalonProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPost" ADD CONSTRAINT "JobPost_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "SalonProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_shiftPostId_fkey" FOREIGN KEY ("shiftPostId") REFERENCES "ShiftPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobPostId_fkey" FOREIGN KEY ("jobPostId") REFERENCES "JobPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_groomerId_fkey" FOREIGN KEY ("groomerId") REFERENCES "GroomerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Engagement" ADD CONSTRAINT "Engagement_shiftPostId_fkey" FOREIGN KEY ("shiftPostId") REFERENCES "ShiftPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Engagement" ADD CONSTRAINT "Engagement_jobPostId_fkey" FOREIGN KEY ("jobPostId") REFERENCES "JobPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Engagement" ADD CONSTRAINT "Engagement_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "SalonProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Engagement" ADD CONSTRAINT "Engagement_groomerId_fkey" FOREIGN KEY ("groomerId") REFERENCES "GroomerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewerSalonId_fkey" FOREIGN KEY ("reviewerSalonId") REFERENCES "SalonProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_subjectSalonId_fkey" FOREIGN KEY ("subjectSalonId") REFERENCES "SalonProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewerGroomerId_fkey" FOREIGN KEY ("reviewerGroomerId") REFERENCES "GroomerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_subjectGroomerId_fkey" FOREIGN KEY ("subjectGroomerId") REFERENCES "GroomerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftInvite" ADD CONSTRAINT "ShiftInvite_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "ShiftPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftInvite" ADD CONSTRAINT "ShiftInvite_groomerId_fkey" FOREIGN KEY ("groomerId") REFERENCES "GroomerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditLedger" ADD CONSTRAINT "CreditLedger_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "SalonProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditLedger" ADD CONSTRAINT "CreditLedger_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "ShiftPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponUse" ADD CONSTRAINT "CouponUse_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponUse" ADD CONSTRAINT "CouponUse_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "SalonProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminModerationAction" ADD CONSTRAINT "AdminModerationAction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpenSlot" ADD CONSTRAINT "OpenSlot_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "SalonProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
