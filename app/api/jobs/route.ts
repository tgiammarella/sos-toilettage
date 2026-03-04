import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const CreateJobSchema = z.object({
  title:          z.string().min(1),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT"]),
  city:           z.string().min(1),
  region:         z.string().min(1),
  description:    z.string().min(1),
  payInfo:        z.string().optional(),
  requirements:   z.string().optional(),
  publishNow:     z.boolean().default(true),
});

export async function POST(req: NextRequest) {
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

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CreateJobSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { title, employmentType, city, region, description, payInfo, requirements, publishNow } =
    parsed.data;

  const job = await prisma.jobPost.create({
    data: {
      salonId: salon.id,
      title,
      employmentType,
      city,
      region,
      description,
      payInfo:      payInfo      ?? null,
      requirements: requirements ?? null,
      status:      publishNow ? "PUBLISHED" : "DRAFT",
      publishedAt: publishNow ? new Date() : null,
    },
    select: { id: true },
  });

  return NextResponse.json({ id: job.id }, { status: 201 });
}
