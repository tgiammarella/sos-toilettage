import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notifyShiftInvite } from "@/lib/notifications";
import { checkRateLimit } from "@/lib/rate-limit";

const InviteSchema = z.object({ groomerId: z.string().min(1) });

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const limited = await checkRateLimit(req, "moderate");
  if (limited) return limited;

  const session = await auth();
  if (!session || session.user.role !== "SALON") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const salon = await prisma.salonProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, name: true },
  });
  if (!salon) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const shift = await prisma.shiftPost.findUnique({
    where: { id },
    select: { id: true, salonId: true, date: true, city: true },
  });
  if (!shift || shift.salonId !== salon.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const parsed = InviteSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "groomerId required" }, { status: 400 });
  }
  const { groomerId } = parsed.data;

  const groomer = await prisma.groomerProfile.findUnique({
    where: { id: groomerId },
    select: { id: true, fullName: true, user: { select: { email: true } } },
  });
  if (!groomer) {
    return NextResponse.json({ error: "Groomer not found" }, { status: 404 });
  }

  // Upsert invite (idempotent — salon can re-invite)
  await prisma.shiftInvite.upsert({
    where: { shiftId_groomerId: { shiftId: id, groomerId } },
    create: { shiftId: id, groomerId },
    update: { sentAt: new Date(), status: "PENDING" },
  });

  notifyShiftInvite({
    groomerEmail: groomer.user.email,
    groomerName: groomer.fullName,
    salonName: salon.name,
    shiftDate: shift.date.toLocaleDateString("fr-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    shiftCity: shift.city,
    shiftId: id,
  }).catch((err) => console.error("Notification failed", err));

  return NextResponse.json({ ok: true });
}
