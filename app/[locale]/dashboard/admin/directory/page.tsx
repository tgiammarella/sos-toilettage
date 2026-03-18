export const dynamic = "force-dynamic";

import { requireRole } from "@/lib/auth-guards";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Star } from "lucide-react";

const TYPE_LABELS: Record<string, Record<string, string>> = {
  SCHOOL:        { fr: "École",         en: "School" },
  COURSE:        { fr: "Formation",     en: "Course" },
  WORKSHOP:      { fr: "Atelier",       en: "Workshop" },
  CERTIFICATION: { fr: "Certification", en: "Certification" },
};

export default async function AdminDirectoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireRole(locale, "ADMIN");
  const t = await getTranslations({ locale, namespace: "dashboard.admin" });
  const lang = locale === "fr" ? "fr" : "en";

  const listings = await prisma.trainingListing.findMany({
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  });

  return (
    <AdminShell locale={locale}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#1F2933]">{t("directory")}</h1>
          <Button size="sm" asChild>
            <Link href={`/${locale}/dashboard/admin/directory/new`}>
              <Plus className="h-4 w-4 mr-1" />
              {t("new_listing")}
            </Link>
          </Button>
        </div>

        {listings.length === 0 ? (
          <Card className="border-dashed shadow-none">
            <CardContent className="py-12 text-center text-muted-foreground text-sm">
              {lang === "fr" ? "Aucune entrée dans le répertoire." : "No directory entries yet."}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {listings.map((listing) => (
              <Link
                key={listing.id}
                href={`/${locale}/dashboard/admin/directory/${listing.id}`}
                className="block"
              >
                <Card className="border shadow-none hover:shadow-sm transition-shadow cursor-pointer">
                  <CardContent className="py-4 px-5 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{listing.name}</p>
                        {listing.isFeatured && (
                          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {listing.city}{listing.province ? `, ${listing.province}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="secondary" className="text-xs">
                        {TYPE_LABELS[listing.type]?.[lang] ?? listing.type}
                      </Badge>
                      <Badge variant={listing.isActive ? "default" : "outline"} className="text-xs">
                        {listing.isActive
                          ? (lang === "fr" ? "Actif" : "Active")
                          : (lang === "fr" ? "Inactif" : "Inactive")}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
