import { prisma } from "@/lib/prisma";
import type { OpenSlotService, DogSize, OpenSlotStatus } from "@prisma/client";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CreateOpenSlotInput {
  date: Date;
  durationMin: number;
  serviceType: OpenSlotService;
  dogSize?: DogSize | null;
  price?: number | null;
  notes?: string | null;
}

export interface PublicSlotFilters {
  serviceType?: OpenSlotService;
  dogSize?: DogSize;
  date?: string; // ISO date string YYYY-MM-DD
}

// ─── 1. createOpenSlot ──────────────────────────────────────────────────────

export async function createOpenSlot(salonId: string, data: CreateOpenSlotInput) {
  const salon = await prisma.salonProfile.findUnique({
    where: { id: salonId },
    select: { subscriptionPlan: true },
  });

  if (!salon || salon.subscriptionPlan === "NONE") {
    throw new OpenSlotError("SUBSCRIPTION_REQUIRED", 403);
  }

  return prisma.openSlot.create({
    data: {
      salonId,
      date: data.date,
      durationMin: data.durationMin,
      serviceType: data.serviceType,
      dogSize: data.dogSize ?? null,
      price: data.price ?? null,
      notes: data.notes ?? null,
      expiresAt: data.date,
    },
  });
}

// ─── 2. getPublicOpenSlots ──────────────────────────────────────────────────

export async function getPublicOpenSlots(filters?: PublicSlotFilters) {
  const now = new Date();

  // Auto-expire stale slots (fire-and-forget)
  prisma.openSlot
    .updateMany({
      where: { status: "ACTIVE", expiresAt: { lt: now } },
      data: { status: "EXPIRED" },
    })
    .catch((err) => console.error("[OPEN SLOTS] Auto-expire failed", err));

  const where: Record<string, unknown> = {
    status: "ACTIVE",
    expiresAt: { gt: now },
  };

  if (filters?.serviceType) where.serviceType = filters.serviceType;
  if (filters?.dogSize) where.dogSize = filters.dogSize;
  if (filters?.date) {
    const dayStart = new Date(filters.date);
    const dayEnd = new Date(filters.date);
    dayEnd.setDate(dayEnd.getDate() + 1);
    where.date = { gte: dayStart, lt: dayEnd };
  }

  return prisma.openSlot.findMany({
    where,
    orderBy: { date: "asc" },
    include: {
      salon: {
        select: {
          id: true,
          name: true,
          city: true,
          region: true,
          phone: true,
          website: true,
          user: { select: { email: true } },
        },
      },
    },
  });
}

// ─── 3. getSalonOpenSlots ───────────────────────────────────────────────────

export async function getSalonOpenSlots(salonId: string) {
  return prisma.openSlot.findMany({
    where: { salonId },
    orderBy: { date: "desc" },
  });
}

// ─── 4. getSalonPublicOpenSlots ─────────────────────────────────────────────

export async function getSalonPublicOpenSlots(salonId: string) {
  const now = new Date();

  // Auto-expire
  await prisma.openSlot.updateMany({
    where: { salonId, status: "ACTIVE", expiresAt: { lt: now } },
    data: { status: "EXPIRED" },
  });

  return prisma.openSlot.findMany({
    where: { salonId, status: "ACTIVE", expiresAt: { gt: now } },
    orderBy: { date: "asc" },
    include: {
      salon: {
        select: {
          id: true,
          name: true,
          city: true,
          region: true,
          phone: true,
          website: true,
          user: { select: { email: true } },
        },
      },
    },
  });
}

// ─── 5. updateOpenSlotStatus ────────────────────────────────────────────────

export async function updateOpenSlotStatus(
  slotId: string,
  salonId: string,
  status: Extract<OpenSlotStatus, "FILLED" | "CANCELLED">,
) {
  const slot = await prisma.openSlot.findUnique({
    where: { id: slotId },
    select: { salonId: true, status: true },
  });

  if (!slot) throw new OpenSlotError("NOT_FOUND", 404);
  if (slot.salonId !== salonId) throw new OpenSlotError("FORBIDDEN", 403);
  if (slot.status !== "ACTIVE") throw new OpenSlotError("SLOT_NOT_ACTIVE", 409);

  return prisma.openSlot.update({
    where: { id: slotId },
    data: { status },
  });
}

// ─── Error class ────────────────────────────────────────────────────────────

export class OpenSlotError extends Error {
  constructor(public code: string, public httpStatus: number) {
    super(code);
  }
}
