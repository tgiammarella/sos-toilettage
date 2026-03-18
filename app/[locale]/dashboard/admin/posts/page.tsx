export const dynamic = "force-dynamic";

import { requireRole } from "@/lib/auth-guards";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default async function AdminPostsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireRole(locale, "ADMIN");
  const t = await getTranslations({ locale, namespace: "dashboard.admin" });

  const [shifts, jobs] = await Promise.all([
    prisma.shiftPost.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { salon: { select: { name: true } } },
    }),
    prisma.jobPost.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { salon: { select: { name: true } } },
    }),
  ]);

  const statusLabel = (s: string) => {
    const map: Record<string, Record<string, string>> = {
      DRAFT:     { fr: "Brouillon",  en: "Draft" },
      PUBLISHED: { fr: "Publié",     en: "Published" },
      FILLED:    { fr: "Comblé",     en: "Filled" },
      ARCHIVED:  { fr: "Archivé",    en: "Archived" },
    };
    return map[s]?.[locale] ?? s;
  };

  return (
    <AdminShell locale={locale}>
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-[#1F2933]">{t("posts")}</h1>

        <section>
          <h2 className="text-lg font-semibold mb-3">
            {locale === "fr" ? "Remplacements" : "Shifts"} ({shifts.length})
          </h2>
          <div className="space-y-2">
            {shifts.map((s) => (
              <Card key={s.id} className="border shadow-none">
                <CardContent className="py-3 px-5 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{s.salon.name} — {s.city}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(s.date).toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {s.isUrgent && (
                      <Badge variant="destructive" className="text-xs">URGENT</Badge>
                    )}
                    <Badge variant={s.status === "PUBLISHED" ? "default" : "outline"} className="text-xs">
                      {statusLabel(s.status)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
            {shifts.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {locale === "fr" ? "Aucun remplacement." : "No shifts."}
              </p>
            )}
          </div>
        </section>

        <Separator />

        <section>
          <h2 className="text-lg font-semibold mb-3">
            {locale === "fr" ? "Offres d'emploi" : "Job Posts"} ({jobs.length})
          </h2>
          <div className="space-y-2">
            {jobs.map((j) => (
              <Card key={j.id} className="border shadow-none">
                <CardContent className="py-3 px-5 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{j.title}</p>
                    <p className="text-xs text-muted-foreground">{j.salon.name} — {j.city}</p>
                  </div>
                  <Badge variant={j.status === "PUBLISHED" ? "default" : "outline"} className="text-xs shrink-0">
                    {statusLabel(j.status)}
                  </Badge>
                </CardContent>
              </Card>
            ))}
            {jobs.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {locale === "fr" ? "Aucune offre." : "No jobs."}
              </p>
            )}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
