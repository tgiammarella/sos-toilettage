import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { deductCredit } from "@/lib/credits";

const CreateShiftSchema = z.object({
  date: z.string().min(1, "Date required"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Format HH:MM"),
  address: z.string().min(1),
  city: z.string().min(1),
  region: z.string().min(1),
  postalCode: z.string().min(1),
  numberOfAppointments: z.coerce.number().int().min(1).max(30),
  payType: z.enum(["HOURLY", "FLAT"]),
  payRateCents: z.coerce.number().int().min(1),
  requiredExperienceYears: z.coerce.number().int().min(0).max(30),
  // Sent as JSON-encoded array string from client
  criteriaTags: z.string().default("[]"),
  equipmentProvided: z.coerce.boolean().default(false),
  isUrgent: z.coerce.boolean().default(false),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "SALON") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const salon = await prisma.salonProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, creditsAvailable: true },
  });

  if (!salon) {
    return NextResponse.json({ error: "Salon profile not found" }, { status: 404 });
  }

  if (salon.creditsAvailable < 1) {
    return NextResponse.json(
      { error: "INSUFFICIENT_CREDITS", message: "Vous n'avez pas assez de crédits pour publier un remplacement." },
      { status: 402 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CreateShiftSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", issues: parsed.error.flatten() }, { status: 422 });
  }

  const data = parsed.data;

  // Create shift as PUBLISHED and deduct credit atomically
  const shift = await prisma.$transaction(async (tx) => {
    const created = await tx.shiftPost.create({
      data: {
        salonId: salon.id,
        date: new Date(data.date),
        startTime: data.startTime,
        address: data.address,
        city: data.city,
        region: data.region,
        postalCode: data.postalCode,
        numberOfAppointments: data.numberOfAppointments,
        payType: data.payType,
        payRateCents: data.payRateCents,
        requiredExperienceYears: data.requiredExperienceYears,
        criteriaTags: data.criteriaTags,
        equipmentProvided: data.equipmentProvided,
        isUrgent: data.isUrgent,
        notes: data.notes,
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });

    await tx.salonProfile.update({
      where: { id: salon.id },
      data: { creditsAvailable: { decrement: 1 } },
    });

    await tx.creditLedger.create({
      data: {
        salonId: salon.id,
        type: "DEBIT",
        amount: -1,
        reason: "SHIFT_PUBLISHED",
        shiftId: created.id,
      },
    });

    return created;
  });

  return NextResponse.json({ shift }, { status: 201 });
}
