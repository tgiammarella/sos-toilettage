import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

const PatchSchema = z.object({
  title:          z.string().min(1).max(200),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT"]),
  city:           z.string().min(1).max(100),
  region:         z.string().min(1).max(100),
  description:    z.string().min(1),
  payInfo:        z.string().max(200).optional(),
  requirements:   z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    select: { id: true },
  });
  if (!salon) {
    return NextResponse.json({ error: "Salon not found" }, { status: 404 });
  }

  // Ownership check
  const existing = await prisma.jobPost.findUnique({
    where: { id },
    select: { salonId: true },
  });
  if (!existing || existing.salonId !== salon.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { title, employmentType, city, region, description, payInfo, requirements } =
    parsed.data;

  await prisma.jobPost.update({
    where: { id },
    data: {
      title,
      employmentType,
      city,
      region,
      description,
      payInfo:      payInfo      ?? null,
      requirements: requirements ?? null,
    },
  });

  return NextResponse.json({ ok: true });
}
