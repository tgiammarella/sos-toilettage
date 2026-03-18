import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

const SPECIALIZATIONS = [
  "AGGRESSIVE_DOGS",
  "COLOR",
  "BIG_DOGS",
  "RABBITS",
  "CATS",
  "SPECIALTY_CUTS",
] as const;

const Schema = z.object({
  fullName: z.string().min(2).max(80),
  city: z.string().min(2).max(80),
  yearsExperience: z.number().int().min(0).max(60),
  bio: z.string().max(800).optional(),
  specializations: z.array(z.enum(SPECIALIZATIONS)).optional(),
});

export async function POST(req: NextRequest) {
  const limited = await checkRateLimit(req, "moderate");
  if (limited) return limited;

  const session = await auth();
  if (!session || session.user.role !== "GROOMER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { fullName, city, yearsExperience, bio, specializations } =
    parsed.data;

  await prisma.groomerProfile.update({
    where: { userId: session.user.id },
    data: {
      fullName,
      city,
      region: city,
      yearsExperience,
      bio: bio ?? null,
      specializations: JSON.stringify(specializations ?? []),
    },
  });

  return NextResponse.json({ ok: true });
}
