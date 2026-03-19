import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const PartnerSchema = z.object({
  name: z.string().min(1).max(200),
  taglineFr: z.string().max(500).default(""),
  taglineEn: z.string().max(500).default(""),
  website: z.string().max(500).default(""),
  logoUrl: z.string().max(500).nullable().optional(),
  category: z.enum(["brand", "school", "tech", "industry"]).default("brand"),
  tier: z.enum(["DECOUVERTE", "VEDETTE", "SIGNATURE"]).default("DECOUVERTE"),
  launchPricing: z.boolean().default(false),
  lockedMonthlyRate: z.number().int().nullable().optional(),
  memberDiscountPercent: z.number().int().min(10).max(15).nullable().optional(),
  featured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  isApproved: z.boolean().default(false),
  promoCode: z.string().max(100).nullable().optional(),
  promoDescFr: z.string().max(300).nullable().optional(),
  promoDescEn: z.string().max(300).nullable().optional(),
});

// GET — list all partners (admin only)
export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const partners = await prisma.partner.findMany({
    orderBy: [{ featured: "desc" }, { name: "asc" }],
  });

  return NextResponse.json(partners);
}

// POST — create a partner
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = PartnerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
  }

  const partner = await prisma.partner.create({
    data: parsed.data,
  });

  return NextResponse.json(partner, { status: 201 });
}
