import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const UpdateSchema = z.object({
  name:        z.string().min(1).optional(),
  type:        z.enum(["SCHOOL", "COURSE", "WORKSHOP", "CERTIFICATION"]).optional(),
  city:        z.string().min(1).optional(),
  province:    z.string().optional(),
  description: z.string().optional(),
  websiteUrl:  z.string().url().optional().or(z.literal("")),
  logoUrl:     z.string().url().optional().or(z.literal("")),
  phone:       z.string().optional(),
  email:       z.string().email().optional().or(z.literal("")),
  tags:        z.array(z.string()).optional(),
  tier:        z.enum(["GRATUIT", "PARTENAIRE", "ELITE", "FREE"]).optional(),
  isTrainer:   z.boolean().optional(),
  isFeatured:  z.boolean().optional(),
  isActive:    z.boolean().optional(),
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
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", issues: parsed.error.flatten() }, { status: 422 });
  }

  const existing = await prisma.trainingListing.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { tags, websiteUrl, logoUrl, email, city, ...rest } = parsed.data;

  const listing = await prisma.trainingListing.update({
    where: { id },
    data: {
      ...rest,
      ...(city !== undefined ? { city, region: city } : {}),
      ...(websiteUrl !== undefined ? { websiteUrl: websiteUrl || null } : {}),
      ...(logoUrl !== undefined ? { logoUrl: logoUrl || null } : {}),
      ...(email !== undefined ? { email: email || null } : {}),
      ...(tags !== undefined ? { tags: JSON.stringify(tags) } : {}),
    },
  });

  return NextResponse.json({ listing });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.trainingListing.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.trainingListing.delete({ where: { id } });

  return NextResponse.json({ deleted: true });
}
