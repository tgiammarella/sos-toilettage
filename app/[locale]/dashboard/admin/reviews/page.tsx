export const dynamic = "force-dynamic";

import { requireRole } from "@/lib/auth-guards";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

export default async function AdminReviewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireRole(locale, "ADMIN");
  const t = await getTranslations({ locale, namespace: "dashboard.admin" });

  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      reviewerSalon:   { select: { name: true } },
      reviewerGroomer: { select: { fullName: true } },
      subjectSalon:    { select: { name: true } },
      subjectGroomer:  { select: { fullName: true } },
    },
  });

  return (
    <AdminShell locale={locale}>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-[#1F2933]">{t("reviews")}</h1>

        {reviews.length === 0 ? (
          <Card className="border-dashed shadow-none">
            <CardContent className="py-12 text-center text-muted-foreground text-sm">
              {locale === "fr" ? "Aucune évaluation." : "No reviews yet."}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => {
              const reviewer = r.reviewerSalon?.name ?? r.reviewerGroomer?.fullName ?? "—";
              const subject  = r.subjectSalon?.name  ?? r.subjectGroomer?.fullName  ?? "—";
              return (
                <Card key={r.id} className="border shadow-none">
                  <CardContent className="py-4 px-5">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <p className="text-sm font-medium">
                        {reviewer} → {subject}
                      </p>
                      <div className="flex items-center gap-1 shrink-0">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-accent text-accent" />
                        ))}
                      </div>
                    </div>
                    {r.text && <p className="text-sm text-muted-foreground italic">{r.text}</p>}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(r.createdAt).toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA")}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
