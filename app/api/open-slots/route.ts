import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createOpenSlot, getPublicOpenSlots, OpenSlotError } from "@/lib/open-slots";
import { checkRateLimit } from "@/lib/rate-limit";
import type { OpenSlotService, DogSize } from "@prisma/client";

const CreateSlotSchema = z.object({
  date: z.string().min(1),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  durationMin: z.coerce.number().int().min(15).max(240),
  serviceType: z.enum(["BAIN_COUPE", "BAIN_SEULEMENT", "COUPE_SEULEMENT", "TOILETTAGE_COMPLET", "AUTRE"]),
  dogSize: z.enum(["TRES_PETIT", "PETIT", "MOYEN", "GRAND", "TRES_GRAND"]).optional(),
  price: z.coerce.number().min(0).optional(),
  notes: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const limited = await checkRateLimit(req, "moderate");
  if (limited) return limited;

  const session = await auth();
  if (!session || session.user.role !== "SALON") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const salon = await prisma.salonProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!salon) {
    return NextResponse.json({ error: "Salon not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CreateSlotSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", issues: parsed.error.flatten() }, { status: 422 });
  }

  const { date, time, durationMin, serviceType, dogSize, price, notes } = parsed.data;
  const dateTime = new Date(`${date}T${time}:00`);

  try {
    const slot = await createOpenSlot(salon.id, {
      date: dateTime,
      durationMin,
      serviceType,
      dogSize: dogSize as DogSize | undefined,
      price,
      notes,
    });
    return NextResponse.json({ slot }, { status: 201 });
  } catch (err) {
    if (err instanceof OpenSlotError) {
      return NextResponse.json({ error: err.code }, { status: err.httpStatus });
    }
    throw err;
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const serviceType = url.searchParams.get("serviceType") as OpenSlotService | null;
  const dogSize = url.searchParams.get("dogSize") as DogSize | null;
  const date = url.searchParams.get("date");

  const slots = await getPublicOpenSlots({
    serviceType: serviceType || undefined,
    dogSize: dogSize || undefined,
    date: date || undefined,
  });

  return NextResponse.json(slots);
}
