export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/nav/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  ExternalLink,
  GraduationCap,
  Phone,
  Mail,
  ArrowLeft,
  Star,
  Lock,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const TYPE_LABELS: Record<string, Record<string, string>> = {
  SCHOOL: { fr: "École", en: "School" },
  COURSE: { fr: "Formation", en: "Course" },
  WORKSHOP: { fr: "Atelier", en: "Workshop" },
  CERTIFICATION: { fr: "Certification", en: "Certification" },
};

export default async function SchoolDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations("graduates");
  const lang = locale === "fr" ? "fr" : "en";

  const session = await auth();
  const isAuthenticated = !!session?.user?.id;

  const listing = await prisma.trainingListing.findUnique({
    where: { id, isActive: true },
    include: {
      graduates: {
        where: { isVisible: true },
        orderBy: [{ graduationYear: "desc" }, { lastName: "asc" }],
      },
    },
  });

  if (!listing) notFound();

  const tags: string[] = (() => {
    try {
      const parsed = JSON.parse(listing.tags || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-muted/20">
        <div className="container mx-auto px-4 py-10 max-w-3xl">
          {/* Back link */}
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="mb-6 -ml-2"
          >
            <Link href={`/${locale}/schools`}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              {t("back_to_directory")}
            </Link>
          </Button>

          {/* ── School info ── */}
          <Card className="border shadow-sm bg-white mb-8">
            <CardContent className="py-6 px-6">
              <div className="flex items-start gap-4 mb-4">
                {listing.logoUrl && (
                  <Image
                    src={listing.logoUrl}
                    alt={listing.name}
                    width={56}
                    height={56}
                    className="rounded-md object-contain shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h1 className="text-xl font-bold text-[#1F2933]">
                      {listing.name}
                    </h1>
                    {listing.isFeatured && (
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    )}
                    <Badge className="text-xs bg-[#F6EFE6] text-[#055864]">
                      {TYPE_LABELS[listing.type]?.[lang] ?? listing.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-[#4a6260]">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {listing.city}
                    {listing.province ? `, ${listing.province}` : ""}
                  </div>
                </div>
              </div>

              {listing.description && (
                <p className="text-sm text-[#4a6260] mb-4 leading-relaxed">
                  {listing.description}
                </p>
              )}

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                {listing.websiteUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={listing.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                      {t("visit_website")}
                    </a>
                  </Button>
                )}
                {listing.phone && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`tel:${listing.phone}`}>
                      <Phone className="h-3.5 w-3.5 mr-1.5" />
                      {listing.phone}
                    </a>
                  </Button>
                )}
                {listing.email && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`mailto:${listing.email}`}>
                      <Mail className="h-3.5 w-3.5 mr-1.5" />
                      {t("contact")}
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ── Graduates section ── */}
          {listing.graduates.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-5">
                <GraduationCap className="h-5 w-5 text-[#055864]" />
                <h2 className="text-lg font-semibold text-[#1F2933]">
                  {t("our_graduates")}
                </h2>
                <Badge variant="outline" className="text-xs">
                  {listing.graduates.length}
                </Badge>
              </div>

              {!isAuthenticated && (
                <Card className="border-dashed border-[#CBBBA6] bg-[#F6EFE6]/50 mb-5">
                  <CardContent className="py-4 px-5 flex items-center gap-3">
                    <Lock className="h-4 w-4 text-[#055864] shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-[#055864] font-medium">
                        {t("login_cta")}
                      </p>
                    </div>
                    <Button size="sm" asChild>
                      <Link href={`/${locale}/auth/login`}>
                        {t("login_button")}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {listing.graduates.map((graduate) => {
                  const displayName = `${graduate.firstName} ${graduate.lastName.charAt(0)}.`;
                  return (
                    <Card
                      key={graduate.id}
                      className="border shadow-sm bg-white hover:shadow-md transition-shadow"
                    >
                      <CardContent className="py-4 px-5">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <p className="font-medium text-[#1F2933]">
                              {displayName}
                            </p>
                            <p className="text-xs text-[#4a6260]">
                              {t("class_of")} {graduate.graduationYear}
                            </p>
                          </div>
                          <Badge
                            className={`text-xs shrink-0 ${
                              graduate.isAvailable
                                ? "bg-teal-50 text-teal-700 border-teal-200"
                                : "bg-gray-100 text-gray-500 border-gray-200"
                            }`}
                            variant="outline"
                          >
                            {graduate.isAvailable
                              ? t("available")
                              : t("not_available")}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-[#4a6260] mb-2">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {graduate.regionQc}
                        </div>

                        {graduate.specialties.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {graduate.specialties.map((s) => (
                              <Badge
                                key={s}
                                variant="outline"
                                className="text-[10px] py-0 bg-[#F6EFE6] border-[#CBBBA6] text-[#055864]"
                              >
                                {s}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {isAuthenticated && graduate.bio && (
                          <p className="text-xs text-[#4a6260] mt-2 line-clamp-3">
                            {graduate.bio}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
