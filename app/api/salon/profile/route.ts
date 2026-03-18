import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

const PatchSchema = z.object({
  name:  z.string().min(1).max(150),
  phone: z.string().max(30).optional(),
  city:  z.string().min(1).max(100),
});

export async function PATCH(req: NextRequest) {
  const limited = await checkRateLimit(req, "moderate");
  if (limited) return limited;

  const session = await auth();
  if (!session || session.user.role !== "SALON") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  const { name, phone, city } = parsed.data;

  await prisma.salonProfile.update({
    where: { userId: session.user.id },
    data: {
      name,
      phone:  phone ?? null,
      city,
      region: city, // keep region in sync
    },
  });

  return NextResponse.json({ ok: true });
}
