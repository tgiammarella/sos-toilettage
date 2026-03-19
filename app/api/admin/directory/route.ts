import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const CreateSchema = z.object({
  name:        z.string().min(1),
  type:        z.enum(["SCHOOL", "COURSE", "WORKSHOP", "CERTIFICATION"]),
  city:        z.string().min(1),
  province:    z.string().default(""),
  description: z.string().optional(),
  websiteUrl:  z.string().url().optional().or(z.literal("")),
  logoUrl:     z.string().url().optional().or(z.literal("")),
  phone:       z.string().optional(),
  email:       z.string().email().optional().or(z.literal("")),
  tags:        z.array(z.string()).default([]),
  tier:        z.enum(["GRATUIT", "PARTENAIRE", "ELITE", "FREE"]).default("GRATUIT"),
  isTrainer:   z.boolean().default(false),
  isFeatured:  z.boolean().default(false),
  isActive:    z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", issues: parsed.error.flatten() }, { status: 422 });
  }

  const { tags, websiteUrl, logoUrl, email, ...rest } = parsed.data;

  const listing = await prisma.trainingListing.create({
    data: {
      ...rest,
      region: rest.city,
      websiteUrl: websiteUrl || null,
      logoUrl: logoUrl || null,
      email: email || null,
      tags: JSON.stringify(tags),
    },
  });

  return NextResponse.json({ listing }, { status: 201 });
}
