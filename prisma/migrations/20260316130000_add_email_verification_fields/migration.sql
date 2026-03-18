-- Add email verification fields to User
ALTER TABLE "User" ADD COLUMN "verifyToken" TEXT;
ALTER TABLE "User" ADD COLUMN "verifyTokenExpiry" DATETIME;
CREATE UNIQUE INDEX "User_verifyToken_key" ON "User"("verifyToken");
