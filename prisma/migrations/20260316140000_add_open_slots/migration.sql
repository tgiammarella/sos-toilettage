-- CreateTable
CREATE TABLE "OpenSlot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "salonId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "serviceType" TEXT NOT NULL,
    "dogSize" TEXT,
    "price" REAL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OpenSlot_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "SalonProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "OpenSlot_status_expiresAt_idx" ON "OpenSlot"("status", "expiresAt");
CREATE INDEX "OpenSlot_salonId_status_idx" ON "OpenSlot"("salonId", "status");
