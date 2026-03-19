import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  taglineFr: z.string().max(500).optional(),
  taglineEn: z.string().max(500).optional(),
  website: z.string().max(500).optional(),
  logoUrl: z.string().max(500).nullable().optional(),
  category: z.enum(["brand", "school", "tech", "industry"]).optional(),
  featured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  promoCode: z.string().max(100).nullable().optional(),
  promoDescFr: z.string().max(300).nullable().optional(),
  promoDescEn: z.string().max(300).nullable().optional(),
});

// PATCH — update a partner
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const existing = await prisma.partner.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const partner = await prisma.partner.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json(partner);
}

// DELETE — remove a partner
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.partner.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.partner.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
