-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "image" TEXT,
    "passwordHash" TEXT,
    "role" TEXT NOT NULL DEFAULT 'GROOMER',
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SalonProfile" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SalonProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GroomerProfile" (
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
    "cvUrl" TEXT,
    "bio" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GroomerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ShiftPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "salonId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "startTime" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "lat" REAL,
    "lng" REAL,
    "numberOfAppointments" INTEGER NOT NULL,
    "payType" TEXT NOT NULL,
    "payRateCents" INTEGER NOT NULL,
    "requiredExperienceYears" INTEGER NOT NULL DEFAULT 0,
    "criteriaTags" TEXT NOT NULL DEFAULT '[]',
    "equipmentProvided" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "isUrgent" BOOLEAN NOT NULL DEFAULT false,
    "urgentPurchasedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "publishedAt" DATETIME,
    "filledAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ShiftPost_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "SalonProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JobPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "salonId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "employmentType" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "payInfo" TEXT,
    "requirements" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "JobPost_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "SalonProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postType" TEXT NOT NULL,
    "shiftPostId" TEXT,
    "jobPostId" TEXT,
    "salonId" TEXT NOT NULL,
    "groomerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'APPLIED',
    "message" TEXT,
    "availabilityDates" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Application_shiftPostId_fkey" FOREIGN KEY ("shiftPostId") REFERENCES "ShiftPost" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Application_jobPostId_fkey" FOREIGN KEY ("jobPostId") REFERENCES "JobPost" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Application_groomerId_fkey" FOREIGN KEY ("groomerId") REFERENCES "GroomerProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Engagement" (
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
    CONSTRAINT "Engagement_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "SalonProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Engagement_groomerId_fkey" FOREIGN KEY ("groomerId") REFERENCES "GroomerProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "engagementId" TEXT NOT NULL,
    "reviewerUserId" TEXT NOT NULL,
    "reviewerRole" TEXT NOT NULL,
    "reviewerSalonId" TEXT,
    "reviewerGroomerId" TEXT,
    "subjectUserId" TEXT NOT NULL,
    "subjectRole" TEXT NOT NULL,
    "subjectSalonId" TEXT,
    "subjectGroomerId" TEXT,
    "rating" INTEGER NOT NULL,
    "text" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Review_reviewerSalonId_fkey" FOREIGN KEY ("reviewerSalonId") REFERENCES "SalonProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Review_subjectSalonId_fkey" FOREIGN KEY ("subjectSalonId") REFERENCES "SalonProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Review_reviewerGroomerId_fkey" FOREIGN KEY ("reviewerGroomerId") REFERENCES "GroomerProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Review_subjectGroomerId_fkey" FOREIGN KEY ("subjectGroomerId") REFERENCES "GroomerProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CreditLedger" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "salonId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "shiftId" TEXT,
    "stripeEventId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CreditLedger_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "SalonProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CreditLedger_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "ShiftPost" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrainingListing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "websiteUrl" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "description" TEXT,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

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
CREATE UNIQUE INDEX "Engagement_shiftPostId_key" ON "Engagement"("shiftPostId");

-- CreateIndex
CREATE UNIQUE INDEX "Engagement_jobPostId_key" ON "Engagement"("jobPostId");

-- CreateIndex
CREATE INDEX "Review_subjectUserId_idx" ON "Review"("subjectUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_engagementId_reviewerUserId_key" ON "Review"("engagementId", "reviewerUserId");

-- CreateIndex
CREATE UNIQUE INDEX "CreditLedger_stripeEventId_key" ON "CreditLedger"("stripeEventId");

-- CreateIndex
CREATE INDEX "CreditLedger_salonId_createdAt_idx" ON "CreditLedger"("salonId", "createdAt");
