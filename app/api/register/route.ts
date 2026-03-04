import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const baseSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["SALON", "GROOMER"]),
});

const salonSchema = baseSchema.extend({
  role: z.literal("SALON"),
  salonName: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  region: z.string().min(1),
  postalCode: z.string().min(1),
  phone: z.string().optional(),
});

const groomerSchema = baseSchema.extend({
  role: z.literal("GROOMER"),
  fullName: z.string().min(1),
  city: z.string().min(1),
  region: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const role = body?.role;

    if (role === "SALON") {
      const parsed = salonSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
      }
      const { email, password, salonName, address, city, region, postalCode, phone } =
        parsed.data;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ error: "email_taken" }, { status: 409 });
      }

      const passwordHash = await bcrypt.hash(password, 12);

      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: { email, passwordHash, role: "SALON", name: salonName },
        });
        await tx.salonProfile.create({
          data: { userId: user.id, name: salonName, address, city, region, postalCode, phone },
        });
      });

      return NextResponse.json({ ok: true }, { status: 201 });
    }

    if (role === "GROOMER") {
      const parsed = groomerSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
      }
      const { email, password, fullName, city, region } = parsed.data;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ error: "email_taken" }, { status: 409 });
      }

      const passwordHash = await bcrypt.hash(password, 12);

      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: { email, passwordHash, role: "GROOMER", name: fullName },
        });
        await tx.groomerProfile.create({
          data: { userId: user.id, fullName, city, region },
        });
      });

      return NextResponse.json({ ok: true }, { status: 201 });
    }

    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  } catch (err) {
    console.error("[POST /api/register]", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
