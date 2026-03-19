export const dynamic = "force-dynamic";

import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Star, User } from "lucide-react";

const TYPE_LABELS: Record<string, Record<string, string>> = {
  COURSE:        { fr: "Formation",     en: "Course" },
  WORKSHOP:      { fr: "Atelier",       en: "Workshop" },
  CERTIFICATION: { fr: "Certification", en: "Certification" },
  SCHOOL:        { fr: "École",         en: "School" },
};

export default async function AdminTrainingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireRole(locale, "ADMIN");
  const lang = locale === "fr" ? "fr" : "en";

  const trainings = await prisma.trainingListing.findMany({
    where: {
      OR: [
        { type: { in: ["COURSE", "WORKSHOP", "CERTIFICATION"] } },
        { isTrainer: true },
      ],
    },
    orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
  });

  const trainerCount = trainings.filter((t) => t.isTrainer).length;
  const programCount = trainings.filter((t) => !t.isTrainer).length;

  return (
    <AdminShell locale={locale}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#1F2933]">
            {lang === "fr" ? "Formations" : "Trainings"}
          </h1>
          <Button size="sm" asChild>
            <Link href={`/${locale}/dashboard/admin/trainings/new`}>
              <Plus className="h-4 w-4 mr-1" />
              {lang === "fr" ? "Ajouter" : "Add"}
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="shadow-none">
            <CardContent className="py-3 px-4">
              <p className="text-xs text-muted-foreground">{lang === "fr" ? "Programmes" : "Programs"}</p>
              <p className="text-xl font-bold text-[#1F2933]">{programCount}</p>
            </CardContent>
          </Card>
          <Card className="shadow-none">
            <CardContent className="py-3 px-4">
              <p className="text-xs text-muted-foreground">{lang === "fr" ? "Formateurs indépendants" : "Independent trainers"}</p>
              <p className="text-xl font-bold text-[#1F2933]">{trainerCount}</p>
            </CardContent>
          </Card>
        </div>

        {trainings.length === 0 ? (
          <Card className="border-dashed shadow-none">
            <CardContent className="py-12 text-center text-muted-foreground text-sm">
              {lang === "fr" ? "Aucune formation." : "No trainings yet."}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {trainings.map((training) => (
              <Link
                key={training.id}
                href={`/${locale}/dashboard/admin/directory/${training.id}`}
                className="block"
              >
                <Card className="border shadow-none hover:shadow-sm transition-shadow cursor-pointer">
                  <CardContent className="py-4 px-5 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{training.name}</p>
                        {training.isTrainer && (
                          <Badge variant="outline" className="text-xs gap-0.5">
                            <User className="h-3 w-3" />
                            {lang === "fr" ? "Indépendant" : "Independent"}
                          </Badge>
                        )}
                        {training.isFeatured && (
                          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {training.city}{training.province ? `, ${training.province}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="secondary" className="text-xs">
                        {TYPE_LABELS[training.type]?.[lang] ?? training.type}
                      </Badge>
                      <Badge variant={training.isActive ? "default" : "outline"} className="text-xs">
                        {training.isActive
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
