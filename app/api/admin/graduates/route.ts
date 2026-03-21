import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const SPECIALTIES = [
  "Bain/Séchage",
  "Coupe au ciseau",
  "Tondeuse",
  "Félin",
  "Nordique",
  "Créatif",
];

const CreateSchema = z.object({
  schoolId:       z.string().cuid(),
  firstName:      z.string().min(1),
  lastName:       z.string().min(1),
  graduationYear: z.number().int().min(1990).max(2099),
  regionQc:       z.string().min(1),
  specialties:    z.array(z.string()).default([]),
  bio:            z.string().optional(),
  isAvailable:    z.boolean().default(true),
  isVisible:      z.boolean().default(true),
});

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  // Verify school exists
  const school = await prisma.trainingListing.findUnique({
    where: { id: parsed.data.schoolId },
  });
  if (!school) {
    return NextResponse.json({ error: "School not found" }, { status: 404 });
  }

  // Filter specialties to valid values
  const specialties = parsed.data.specialties.filter((s) =>
    SPECIALTIES.includes(s),
  );

  const graduate = await prisma.graduateProfile.create({
    data: {
      ...parsed.data,
      specialties,
      bio: parsed.data.bio || null,
    },
  });

  return NextResponse.json({ graduate }, { status: 201 });
}

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const schoolId = req.nextUrl.searchParams.get("schoolId");

  const graduates = await prisma.graduateProfile.findMany({
    where: schoolId ? { schoolId } : undefined,
    orderBy: [{ graduationYear: "desc" }, { lastName: "asc" }],
    include: { school: { select: { name: true } } },
  });

  return NextResponse.json({ graduates });
}
