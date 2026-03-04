export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { SalonSidebar } from "@/components/dashboard/SalonSidebar";

export default async function SalonConfirmedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await requireRole(locale, "SALON");

  const tDashboard = await getTranslations("dashboard.salon");

  const salon = await prisma.salonProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      name: true,
      shiftPosts: {
        where: { status: "FILLED" },
        orderBy: { date: "desc" },
        take: 10,
      },
      jobPosts: {
        where: { status: "FILLED" },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!salon) notFound();

  const confirmedLabel = locale === "fr" ? "Confirmé" : "Confirmed";
  const filledLabel = locale === "fr" ? "Comblé" : "Filled";

  return (
    <div className="flex min-h-screen bg-muted/30">
      <SalonSidebar locale={locale} salonName={salon.name} />

      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="max-w-5xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold">{tDashboard("confirmed")}</h1>
            <p className="text-sm text-muted-foreground">
              Historique récent des remplacements et postes confirmés.
            </p>
          </div>

          <Separator />

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Remplacements confirmés
            </h2>
            {salon.shiftPosts.length === 0 ? (
              <Card className="border-dashed shadow-none">
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  Aucun remplacement confirmé pour l&apos;instant.
                </CardContent>
              </Card>
            ) : (
              salon.shiftPosts.map((shift) => (
                <Link
                  key={shift.id}
                  href={`/${locale}/dashboard/salon/shifts/${shift.id}`}
                  className="block"
                >
                  <Card className="border shadow-none hover:shadow-sm transition-shadow cursor-pointer">
                    <CardContent className="py-3 px-5 flex items-center justify-between gap-4">
                      <div className="text-sm">
                        <p className="font-medium">
                          {shift.city} —{" "}
                          {new Date(shift.date).toLocaleDateString(
                            locale === "fr" ? "fr-CA" : "en-CA"
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">{shift.startTime}</p>
                      </div>
                      <Badge variant="secondary" className="inline-flex items-center gap-1 text-xs">
                        <CheckCircle className="h-3.5 w-3.5" />
                        {confirmedLabel}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Postes comblés
            </h2>
            {salon.jobPosts.length === 0 ? (
              <Card className="border-dashed shadow-none">
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  Aucun poste comblé pour l&apos;instant.
                </CardContent>
              </Card>
            ) : (
              salon.jobPosts.map((job) => (
                <Link
                  key={job.id}
                  href={`/${locale}/dashboard/salon/jobs/${job.id}`}
                  className="block"
                >
                  <Card className="border shadow-none hover:shadow-sm transition-shadow cursor-pointer">
                    <CardContent className="py-3 px-5 flex items-center justify-between gap-4">
                      <div className="text-sm">
                        <p className="font-medium truncate">{job.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {job.city} ·{" "}
                          {new Date(job.createdAt).toLocaleDateString(
                            locale === "fr" ? "fr-CA" : "en-CA"
                          )}
                        </p>
                      </div>
                      <Badge variant="secondary" className="inline-flex items-center gap-1 text-xs">
                        <CheckCircle className="h-3.5 w-3.5" />
                        {filledLabel}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
