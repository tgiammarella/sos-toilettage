import { prisma } from "@/lib/prisma";

export type Partner = {
  id: string;
  name: string;
  taglineFr: string;
  taglineEn: string;
  website: string;
  logoUrl: string | null;
  category: string;
  featured: boolean;
  promoCode: string | null;
  promoDescFr: string | null;
  promoDescEn: string | null;
};

export async function getPartners(): Promise<Partner[]> {
  return prisma.partner.findMany({
    where: { isActive: true },
    orderBy: [{ featured: "desc" }, { name: "asc" }],
  });
}

export async function getFeaturedPartners(): Promise<Partner[]> {
  return prisma.partner.findMany({
    where: { isActive: true, featured: true },
    orderBy: { name: "asc" },
  });
}
