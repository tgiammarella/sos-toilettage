-- CreateTable
CREATE TABLE "GraduateProfile" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "graduationYear" INTEGER NOT NULL,
    "regionQc" TEXT NOT NULL,
    "specialties" TEXT[],
    "bio" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GraduateProfile_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GraduateProfile" ADD CONSTRAINT "GraduateProfile_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "TrainingListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
