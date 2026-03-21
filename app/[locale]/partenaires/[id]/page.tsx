export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { getPartnerById, stripPromoFields } from "@/lib/partners";
import { Navbar } from "@/components/nav/Navbar";
import { PartnerProfile } from "@/components/partners/PartnerProfile";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const partner = await prisma.partner.findFirst({
    where: { id, isActive: true, isApproved: true, deletedAt: null },
    select: { name: true, taglineFr: true, taglineEn: true },
  });
  if (!partner) return {};
  const desc = locale === "en" ? partner.taglineEn : partner.taglineFr;
  return {
    title: `${partner.name} — Tout Toilettage`,
    description: desc || partner.name,
  };
}

export default async function PartnerProfilePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const session = await auth();
  const raw = await getPartnerById(id);
  if (!raw) notFound();
  const partner = session ? raw : stripPromoFields(raw);
  const hasPromoCode = !!raw.promoCode; // track whether a code exists even if stripped

  const t = await getTranslations({ locale, namespace: "partners" });

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: partner.name,
    url: partner.website || undefined,
    telephone: partner.phone || undefined,
    address: partner.city
      ? {
          "@type": "PostalAddress",
          addressLocality: partner.city,
          addressRegion: partner.province || "QC",
          addressCountry: "CA",
        }
      : undefined,
    description:
      locale === "en" ? partner.descriptionEn : partner.descriptionFr,
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PartnerProfile partner={partner} locale={locale} showPromoCta={!session && hasPromoCode} />
    </div>
  );
}
