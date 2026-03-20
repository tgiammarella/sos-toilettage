import { prisma } from "@/lib/prisma";

export type Partner = {
  id: string;
  name: string;
  taglineFr: string;
  taglineEn: string;
  descriptionFr: string;
  descriptionEn: string;
  website: string;
  logoUrl: string | null;
  phone: string | null;
  city: string;
  province: string;
  category: string;
  tier: string;
  featured: boolean;
  isApproved: boolean;
  memberDiscountPercent: number | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  tiktokUrl: string | null;
  photos: string;
  tags: string;
  bannerImageUrl: string | null;
  viewCount: number;
  promoCode: string | null;
  promoDescFr: string | null;
  promoDescEn: string | null;
};

/** Fields to never return publicly */
const PUBLIC_SELECT = {
  id: true,
  name: true,
  taglineFr: true,
  taglineEn: true,
  descriptionFr: true,
  descriptionEn: true,
  website: true,
  logoUrl: true,
  phone: true,
  city: true,
  province: true,
  category: true,
  tier: true,
  featured: true,
  isApproved: true,
  memberDiscountPercent: true,
  instagramUrl: true,
  facebookUrl: true,
  tiktokUrl: true,
  photos: true,
  tags: true,
  bannerImageUrl: true,
  viewCount: true,
  promoCode: true,
  promoDescFr: true,
  promoDescEn: true,
} as const;

const PUBLIC_WHERE = {
  isActive: true,
  isApproved: true,
  deletedAt: null,
};

/** Tier sort order for consistent ordering */
const TIER_ORDER: Record<string, number> = {
  SIGNATURE: 0,
  VEDETTE: 1,
  DECOUVERTE: 2,
};

export async function getPartners(): Promise<Partner[]> {
  const partners = await prisma.partner.findMany({
    where: PUBLIC_WHERE,
    select: PUBLIC_SELECT,
    orderBy: [{ featured: "desc" }, { name: "asc" }],
  });
  // Sort by tier priority, then featured, then name
  return partners.sort((a, b) => {
    const tierDiff = (TIER_ORDER[a.tier] ?? 9) - (TIER_ORDER[b.tier] ?? 9);
    if (tierDiff !== 0) return tierDiff;
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

export async function getFeaturedPartners(): Promise<Partner[]> {
  return prisma.partner.findMany({
    where: { ...PUBLIC_WHERE, featured: true },
    select: PUBLIC_SELECT,
    orderBy: { name: "asc" },
  });
}

export async function getPartnerById(id: string): Promise<Partner | null> {
  const partner = await prisma.partner.findFirst({
    where: { id, ...PUBLIC_WHERE },
    select: PUBLIC_SELECT,
  });
  if (!partner) return null;
  // Increment view count
  await prisma.partner.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });
  return partner;
}

export async function getPartnersPage(opts: {
  cursor?: string;
  limit?: number;
  search?: string;
  category?: string;
}): Promise<{ partners: Partner[]; nextCursor: string | null }> {
  const limit = opts.limit ?? 24;

  const where: Record<string, unknown> = { ...PUBLIC_WHERE };

  if (opts.search) {
    const term = opts.search;
    where.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { taglineFr: { contains: term, mode: "insensitive" } },
      { taglineEn: { contains: term, mode: "insensitive" } },
      { descriptionFr: { contains: term, mode: "insensitive" } },
      { descriptionEn: { contains: term, mode: "insensitive" } },
      { tags: { contains: term, mode: "insensitive" } },
    ];
  }

  if (opts.category) {
    where.category = opts.category;
  }

  const partners = await prisma.partner.findMany({
    where,
    select: PUBLIC_SELECT,
    orderBy: [{ featured: "desc" }, { name: "asc" }],
    take: limit + 1,
    ...(opts.cursor ? { skip: 1, cursor: { id: opts.cursor } } : {}),
  });

  const hasMore = partners.length > limit;
  const results = hasMore ? partners.slice(0, limit) : partners;

  // Sort by tier priority
  results.sort((a, b) => {
    const tierDiff = (TIER_ORDER[a.tier] ?? 9) - (TIER_ORDER[b.tier] ?? 9);
    if (tierDiff !== 0) return tierDiff;
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return {
    partners: results,
    nextCursor: hasMore ? results[results.length - 1].id : null,
  };
}
