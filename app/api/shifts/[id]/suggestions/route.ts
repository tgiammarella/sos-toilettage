import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { scoreGroomerForShift, calculateProfileScore } from "@/lib/groomer-scoring";

const DEFAULT_LIMIT = 25;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session || session.user.role !== "SALON") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const url = new URL(req.url);
  const availableToday = url.searchParams.get("availableToday");
  const regionFilter = url.searchParams.get("region");
  const limit = Math.min(
    Math.max(1, parseInt(url.searchParams.get("limit") ?? "", 10) || DEFAULT_LIMIT),
    50,
  );

  const salon = await prisma.salonProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!salon) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const shift = await prisma.shiftPost.findUnique({
    where: { id },
    select: {
      id: true,
      salonId: true,
      city: true,
      region: true,
      criteriaTags: true,
      invites: { select: { groomerId: true } },
    },
  });
  if (!shift || shift.salonId !== salon.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const invitedIds = new Set(shift.invites.map((inv) => inv.groomerId));

  const shiftCriteria: string[] = (() => {
    try {
      const parsed = JSON.parse(shift.criteriaTags || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();

  // Build where clause with optional filters
  const where: Record<string, unknown> = {
    user: { isBanned: false },
  };
  if (availableToday === "true") where.availableToday = true;
  if (regionFilter) where.region = regionFilter;

  const groomers = await prisma.groomerProfile.findMany({
    where,
    take: DEFAULT_LIMIT * 4, // fetch more to allow scoring/filtering
    orderBy: { reliabilityScore: "desc" },
    select: {
      id: true,
      fullName: true,
      city: true,
      region: true,
      yearsExperience: true,
      specializations: true,
      bio: true,
      cvFileUrl: true,
      photoUrl: true,
      availableToday: true,
      reliabilityScore: true,
    },
  });

  const scored = groomers
    .map((g) => ({
      id: g.id,
      fullName: g.fullName,
      city: g.city,
      specializations: g.specializations,
      availableToday: g.availableToday,
      profileScore: calculateProfileScore(g),
      reliabilityScore: g.reliabilityScore,
      score: scoreGroomerForShift(g, shift.city, shift.region, shiftCriteria),
      invited: invitedIds.has(g.id),
    }))
    .filter((g) => g.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return NextResponse.json({
    data: scored,
    meta: { total: scored.length, limit },
  });
}
