import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notifyUrgentShiftToGroomers } from "@/lib/notifications";
import { checkRateLimit } from "@/lib/rate-limit";

// ─── PATCH: Edit an existing shift ──────────────────────────────────────────

const UpdateShiftSchema = z.object({
  date: z.string().min(1).optional(),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Format HH:MM")
    .optional(),
  address: z.string().min(1).max(300).optional(),
  city: z.string().min(1).max(100).optional(),
  postalCode: z.string().min(1).max(10).optional(),
  numberOfAppointments: z.coerce.number().int().min(1).max(30).optional(),
  payType: z.enum(["HOURLY", "FLAT"]).optional(),
  payRateCents: z.coerce.number().int().min(1).optional(),
  requiredExperienceYears: z.coerce.number().int().min(0).max(30).optional(),
  criteriaTags: z.string().optional(),
  equipmentProvided: z.coerce.boolean().optional(),
  isUrgent: z.coerce.boolean().optional(),
  notes: z.string().max(2000).optional().nullable(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = await checkRateLimit(req, "moderate");
  if (limited) return limited;

  const { id } = await params;
  const session = await auth();
  if (!session || session.user.role !== "SALON") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const salon = await prisma.salonProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, name: true, creditsAvailable: true },
  });
  if (!salon) {
    return NextResponse.json({ error: "Salon not found" }, { status: 404 });
  }

  const shift = await prisma.shiftPost.findUnique({
    where: { id },
    select: { id: true, salonId: true, status: true, isUrgent: true },
  });
  if (!shift) {
    return NextResponse.json({ error: "Shift not found" }, { status: 404 });
  }
  if (shift.salonId !== salon.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // FILLED or ARCHIVED shifts cannot be edited
  if (shift.status === "FILLED" || shift.status === "ARCHIVED") {
    return NextResponse.json(
      {
        error: "SHIFT_NOT_EDITABLE",
        message:
          shift.status === "FILLED"
            ? "Un remplacement comblé ne peut plus être modifié."
            : "Un remplacement archivé ne peut plus être modifié.",
      },
      { status: 409 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = UpdateShiftSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const data = parsed.data;

  // Detect urgent transition: false → true requires 1 extra credit
  const urgentUpgrade =
    data.isUrgent === true && shift.isUrgent === false;

  if (urgentUpgrade && salon.creditsAvailable < 1) {
    return NextResponse.json(
      {
        error: "INSUFFICIENT_CREDITS",
        message:
          "Crédits insuffisants pour activer le mode urgent.",
      },
      { status: 402 }
    );
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      // If urgent upgrade, re-check credits inside transaction to prevent race
      if (urgentUpgrade) {
        const current = await tx.salonProfile.findUnique({
          where: { id: salon.id },
          select: { creditsAvailable: true },
        });
        if (!current || current.creditsAvailable < 1) {
          throw new Error("INSUFFICIENT_CREDITS");
        }

        await tx.salonProfile.update({
          where: { id: salon.id },
          data: { creditsAvailable: { decrement: 1 } },
        });

        await tx.creditLedger.create({
          data: {
            salonId: salon.id,
            type: "DEBIT",
            amount: -1,
            reason: "URGENT_UPGRADE",
            shiftId: id,
          },
        });
      }

      // Build update payload — only include fields that were sent
      const updateData: Record<string, unknown> = {};

      if (data.date !== undefined) updateData.date = new Date(data.date);
      if (data.startTime !== undefined) updateData.startTime = data.startTime;
      if (data.address !== undefined) updateData.address = data.address;
      if (data.city !== undefined) {
        updateData.city = data.city;
        updateData.region = data.city; // auto-fill region with city
      }
      if (data.postalCode !== undefined) updateData.postalCode = data.postalCode;
      if (data.numberOfAppointments !== undefined)
        updateData.numberOfAppointments = data.numberOfAppointments;
      if (data.payType !== undefined) updateData.payType = data.payType;
      if (data.payRateCents !== undefined)
        updateData.payRateCents = data.payRateCents;
      if (data.requiredExperienceYears !== undefined)
        updateData.requiredExperienceYears = data.requiredExperienceYears;
      if (data.criteriaTags !== undefined)
        updateData.criteriaTags = data.criteriaTags;
      if (data.equipmentProvided !== undefined)
        updateData.equipmentProvided = data.equipmentProvided;
      if (data.notes !== undefined) updateData.notes = data.notes ?? null;

      if (data.isUrgent !== undefined) {
        updateData.isUrgent = data.isUrgent;
        if (data.isUrgent && !shift.isUrgent) {
          updateData.urgentActivatedAt = new Date();
        }
        if (!data.isUrgent) {
          updateData.urgentActivatedAt = null;
        }
      }

      return tx.shiftPost.update({
        where: { id },
        data: updateData,
      });
    });

    // Fire-and-forget: alert groomers on urgent upgrade
    if (urgentUpgrade) {
      notifyUrgentShiftToGroomers({
        shiftId: id,
        salonName: salon.name,
        city: updated.city,
        date: updated.date.toISOString().split("T")[0],
        startTime: updated.startTime,
        payRateCents: updated.payRateCents,
        payType: updated.payType as "HOURLY" | "FLAT",
      }).catch((err) => console.error("[URGENT ALERT] Failed", err));
    }

    return NextResponse.json({ shift: updated });
  } catch (err) {
    if (err instanceof Error && err.message === "INSUFFICIENT_CREDITS") {
      return NextResponse.json(
        {
          error: "INSUFFICIENT_CREDITS",
          message: "Crédits insuffisants pour activer le mode urgent.",
        },
        { status: 402 }
      );
    }
    throw err;
  }
}

// ─── DELETE: Cancel / remove a shift ────────────────────────────────────────

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = await checkRateLimit(req, "moderate");
  if (limited) return limited;

  const { id } = await params;
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

  const shift = await prisma.shiftPost.findUnique({
    where: { id },
    select: { id: true, salonId: true, status: true },
    // engagement relation via schema's onDelete cascade
  });
  if (!shift) {
    return NextResponse.json({ error: "Shift not found" }, { status: 404 });
  }
  if (shift.salonId !== salon.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // FILLED shifts cannot be deleted — an engagement already exists
  if (shift.status === "FILLED") {
    return NextResponse.json(
      {
        error: "SHIFT_FILLED",
        message:
          "Impossible de supprimer un remplacement déjà comblé. Contactez le support si nécessaire.",
      },
      { status: 409 }
    );
  }

  // Use status transition to ARCHIVED instead of hard delete.
  // This preserves application history and credit ledger references.
  await prisma.shiftPost.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });

  return NextResponse.json({ ok: true });
}
