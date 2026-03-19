export const dynamic = "force-dynamic";

import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Star } from "lucide-react";

const TIER_STYLES: Record<string, { label: Record<string, string>; className: string }> = {
  GRATUIT:    { label: { fr: "Gratuit",    en: "Free" },      className: "bg-gray-100 text-gray-700" },
  PARTENAIRE: { label: { fr: "Partenaire", en: "Partner" },   className: "bg-blue-50 text-blue-700" },
  ELITE:      { label: { fr: "Élite",      en: "Elite" },     className: "bg-purple-50 text-purple-700" },
};

export default async function AdminSchoolsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireRole(locale, "ADMIN");
  const lang = locale === "fr" ? "fr" : "en";

  const schools = await prisma.trainingListing.findMany({
    where: { type: "SCHOOL", isTrainer: false },
    orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
  });

  return (
    <AdminShell locale={locale}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#1F2933]">
            {lang === "fr" ? "Écoles" : "Schools"}
          </h1>
          <Button size="sm" asChild>
            <Link href={`/${locale}/dashboard/admin/schools/new`}>
              <Plus className="h-4 w-4 mr-1" />
              {lang === "fr" ? "Ajouter une école" : "Add school"}
            </Link>
          </Button>
        </div>

        {/* Tier summary */}
        <div className="grid grid-cols-3 gap-3">
          {(["GRATUIT", "PARTENAIRE", "ELITE"] as const).map((tier) => {
            const count = schools.filter((s) => s.tier === tier).length;
            const style = TIER_STYLES[tier];
            return (
              <Card key={tier} className="shadow-none">
                <CardContent className="py-3 px-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{style.label[lang]}</p>
                    <p className="text-xl font-bold text-[#1F2933]">{count}</p>
                  </div>
                  <Badge className={`text-xs ${style.className}`}>{style.label[lang]}</Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {schools.length === 0 ? (
          <Card className="border-dashed shadow-none">
            <CardContent className="py-12 text-center text-muted-foreground text-sm">
              {lang === "fr" ? "Aucune école." : "No schools yet."}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {schools.map((school) => {
              const tierStyle = TIER_STYLES[school.tier] ?? TIER_STYLES.GRATUIT;
              return (
                <Link
                  key={school.id}
                  href={`/${locale}/dashboard/admin/directory/${school.id}`}
                  className="block"
                >
                  <Card className="border shadow-none hover:shadow-sm transition-shadow cursor-pointer">
                    <CardContent className="py-4 px-5 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{school.name}</p>
                          {school.isFeatured && (
                            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {school.city}{school.province ? `, ${school.province}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge className={`text-xs ${tierStyle.className}`}>
                          {tierStyle.label[lang]}
                        </Badge>
                        <Badge variant={school.isActive ? "default" : "outline"} className="text-xs">
                          {school.isActive
                            ? (lang === "fr" ? "Actif" : "Active")
                            : (lang === "fr" ? "Inactif" : "Inactive")}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
