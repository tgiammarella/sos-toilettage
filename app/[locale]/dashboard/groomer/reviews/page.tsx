export const dynamic = "force-dynamic";

import { requireRole } from "@/lib/auth-guards";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star } from "lucide-react";
import { GroomerSidebar } from "@/components/dashboard/GroomerSidebar";

export default async function GroomerReviewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await requireRole(locale, "GROOMER");

  const t = await getTranslations("dashboard.groomer");
  const tDashboard = await getTranslations("dashboard");

  const groomer = await prisma.groomerProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      reviewsReceived: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          engagement: {
            include: {
              salon: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  if (!groomer) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-muted/40">
      <GroomerSidebar locale={locale} groomerName={groomer.fullName} />

      {/* Main */}
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                {tDashboard("welcome")}, {groomer.fullName} 👋
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                {t("reviews")}
              </p>
            </div>
          </div>

          <Separator />

          {groomer.reviewsReceived.length === 0 ? (
            <Card className="border-dashed shadow-none">
              <CardContent className="py-10 text-center text-muted-foreground text-sm">
                Vous n&apos;avez pas encore reçu d&apos;évaluations.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {groomer.reviewsReceived.map((review) => (
                <Card key={review.id} className="border shadow-none">
                  <CardContent className="py-4 px-5 space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {review.engagement.salon?.name ?? "Salon"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(review.createdAt).toLocaleDateString(
                            locale === "fr" ? "fr-CA" : "en-CA",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                      <Badge variant="secondary" className="inline-flex items-center gap-1 text-xs">
                        <Star className="h-3.5 w-3.5" />
                        {review.rating}/5
                      </Badge>
                    </div>
                    {review.text && (
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {review.text}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}


