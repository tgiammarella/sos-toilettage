export const dynamic = "force-dynamic";

import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/nav/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, ExternalLink, GraduationCap, Star, Mail } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const TYPE_LABELS: Record<string, Record<string, string>> = {
  SCHOOL:        { fr: "École",         en: "School" },
  COURSE:        { fr: "Formation",     en: "Course" },
  WORKSHOP:      { fr: "Atelier",       en: "Workshop" },
  CERTIFICATION: { fr: "Certification", en: "Certification" },
};

export default async function SchoolsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("schools");
  const lang = locale === "fr" ? "fr" : "en";

  const listings = await prisma.trainingListing.findMany({
    where: { isActive: true },
    orderBy: [{ isFeatured: "desc" }, { type: "asc" }, { name: "asc" }],
  });

  const featured = listings.filter((l) => l.isFeatured);
  const regular = listings.filter((l) => !l.isFeatured);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-muted/20">
        <div className="container mx-auto px-4 py-10 max-w-5xl">

          {/* ── CTA block ── */}
          <Card className="border-primary/20 bg-white shadow-none mb-10">
            <CardContent className="py-8 px-6 md:px-10 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <GraduationCap className="h-7 w-7 text-primary" />
                  <h1 className="text-2xl font-bold text-[#1F2933]">{t("title")}</h1>
                </div>
                <p className="text-[#4a6260] text-sm leading-relaxed max-w-lg">
                  {lang === "fr"
                    ? "Vous offrez une formation en toilettage ? Tout Toilettage permet aux toiletteurs de découvrir des formations, certifications et perfectionnements dans l'industrie."
                    : "Do you offer grooming training? Tout Toilettage lets groomers discover training programs, certifications and professional development in the industry."}
                </p>
              </div>
              <Button asChild className="shrink-0">
                <Link href={`/${locale}/contact`}>
                  <Mail className="h-4 w-4 mr-2" />
                  {lang === "fr" ? "Ajouter votre formation" : "Add your program"}
                </Link>
              </Button>
            </CardContent>
          </Card>

          <p className="text-[#4a6260] mb-8 text-sm">{t("subtitle")}</p>

          {/* ── Featured section ── */}
          {featured.length > 0 && (
            <section className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                <h2 className="text-lg font-semibold">
                  {lang === "fr" ? "Formations recommandées" : "Recommended programs"}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {featured.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} locale={locale} lang={lang} featured />
                ))}
              </div>
            </section>
          )}

          {/* ── All listings ── */}
          {listings.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center text-muted-foreground">
                {t("no_listings")}
              </CardContent>
            </Card>
          ) : regular.length > 0 ? (
            <>
              {featured.length > 0 && (
                <h2 className="text-lg font-semibold mb-4">
                  {lang === "fr" ? "Toutes les formations" : "All programs"}
                </h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {regular.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} locale={locale} lang={lang} />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}

function ListingCard({
  listing,
  locale,
  lang,
  featured,
}: {
  listing: {
    id: string;
    name: string;
    city: string;
    province: string;
    type: string;
    description: string | null;
    websiteUrl: string | null;
    logoUrl: string | null;
    tags: string;
  };
  locale: string;
  lang: string;
  featured?: boolean;
}) {
  const tags: string[] = (() => {
    try {
      const parsed = JSON.parse(listing.tags || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();

  return (
    <Card className={`border shadow-sm hover:shadow-md transition-shadow bg-white ${featured ? "border-amber-200" : ""}`}>
      <CardContent className="py-5 px-6 h-full flex flex-col">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            {listing.logoUrl && (
              <Image
                src={listing.logoUrl}
                alt={listing.name}
                width={40}
                height={40}
                className="rounded-md object-contain shrink-0"
              />
            )}
            <h3 className="font-semibold text-base leading-snug truncate text-[#1F2933]">{listing.name}</h3>
          </div>
          <span className="inline-flex items-center shrink-0 rounded-md px-2.5 py-0.5 text-xs font-medium bg-[#F6EFE6] text-[#055864]">
            {TYPE_LABELS[listing.type]?.[lang] ?? listing.type}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-[#4a6260] mb-2">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {listing.city}{listing.province ? `, ${listing.province}` : ""}
        </div>

        {listing.description && (
          <p className="text-sm text-[#4a6260] line-clamp-3 flex-1 mb-4">
            {listing.description}
          </p>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
            ))}
          </div>
        )}

        {listing.websiteUrl && (
          <Button variant="outline" size="sm" className="mt-auto w-full" asChild>
            <a href={listing.websiteUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              {locale === "fr" ? "Visiter le site" : "Visit website"}
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
