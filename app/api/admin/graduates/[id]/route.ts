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

const UpdateSchema = z.object({
  firstName:      z.string().min(1).optional(),
  lastName:       z.string().min(1).optional(),
  graduationYear: z.number().int().min(1990).max(2099).optional(),
  regionQc:       z.string().min(1).optional(),
  specialties:    z.array(z.string()).optional(),
  bio:            z.string().optional().nullable(),
  isAvailable:    z.boolean().optional(),
  isVisible:      z.boolean().optional(),
});

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const existing = await prisma.graduateProfile.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { specialties, ...rest } = parsed.data;

  const graduate = await prisma.graduateProfile.update({
    where: { id },
    data: {
      ...rest,
      ...(specialties !== undefined
        ? { specialties: specialties.filter((s) => SPECIALTIES.includes(s)) }
        : {}),
    },
  });

  return NextResponse.json({ graduate });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.graduateProfile.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.graduateProfile.delete({ where: { id } });

  return NextResponse.json({ deleted: true });
}
