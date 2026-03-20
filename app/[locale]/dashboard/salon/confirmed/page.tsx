export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { SalonSidebar } from "@/components/dashboard/SalonSidebar";
import { ReviewForm } from "@/components/reviews/ReviewForm";

export default async function SalonConfirmedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await requireRole(locale, "SALON");
  const t = await getTranslations("confirmed");

  const salon = await prisma.salonProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      name: true,
      engagements: {
        orderBy: { startsAt: "desc" },
        take: 30,
        include: {
          groomer: { select: { id: true, fullName: true, city: true } },
          shiftPost: { select: { city: true, date: true, startTime: true } },
          jobPost: { select: { title: true } },
          reviews: { select: { reviewerUserId: true } },
        },
      },
    },
  });

  if (!salon) notFound();

  const dateLocale = locale === "fr" ? "fr-CA" : "en-CA";

  return (
    <div className="flex min-h-screen bg-muted/30">
      <SalonSidebar locale={locale} salonName={salon.name} />

      <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8 overflow-auto">
        <div className="max-w-5xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1F2933]">{t("salon_title")}</h1>
            <p className="text-sm text-muted-foreground">{t("salon_description")}</p>
          </div>

          <Separator />

          {salon.engagements.length === 0 ? (
            <Card className="border-dashed shadow-none">
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                {t("salon_empty")}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {salon.engagements.map((eng) => {
                const alreadyReviewed = eng.reviews.some(
                  (r) => r.reviewerUserId === session.user.id,
                );

                const postLabel = eng.shiftPost
                  ? `${eng.shiftPost.city} — ${new Date(eng.shiftPost.date).toLocaleDateString(
                      dateLocale,
                      { year: "numeric", month: "short", day: "numeric" },
                    )}${eng.shiftPost.startTime ? ` · ${eng.shiftPost.startTime}` : ""}`
                  : eng.jobPost?.title ?? "—";

                return (
                  <Card key={eng.id} className="border shadow-none">
                    <CardContent className="py-4 px-5 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{eng.groomer.fullName}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {eng.groomer.city} · {postLabel}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className="shrink-0 inline-flex items-center gap-1 text-xs"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          {t("confirmed_badge")}
                        </Badge>
                      </div>

                      {!alreadyReviewed ? (
                        <ReviewForm engagementId={eng.id} locale={locale} />
                      ) : (
                        <p className="text-xs text-muted-foreground italic">
                          {t("review_sent")}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
