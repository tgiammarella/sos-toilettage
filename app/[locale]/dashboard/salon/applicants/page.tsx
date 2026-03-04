export const dynamic = "force-dynamic";

import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, ChevronRight } from "lucide-react";
import { SalonSidebar } from "@/components/dashboard/SalonSidebar";

export default async function SalonApplicantsPage({
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
      jobPosts: {
        select: {
          id: true,
          title: true,
          applications: {
            select: { id: true, status: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!salon) notFound();

  const jobsWithApps = salon.jobPosts.filter((job) => job.applications.length > 0);

  return (
    <div className="flex min-h-screen bg-muted/30">
      <SalonSidebar locale={locale} salonName={salon.name} />

      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{tDashboard("applicants")}</h1>
              <p className="text-sm text-muted-foreground">
                Gérez les candidatures reçues sur vos offres d&apos;emploi.
              </p>
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link href={`/${locale}/dashboard/salon/jobs`}>
                {tDashboard("my_jobs")}
              </Link>
            </Button>
          </div>

          <Separator />

          {jobsWithApps.length === 0 ? (
            <Card className="border-dashed shadow-none">
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                Aucune candidature reçue pour l&apos;instant.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {jobsWithApps.map((job) => {
                const total = job.applications.length;
                const pending = job.applications.filter((a) => a.status === "APPLIED").length;

                return (
                  <Card key={job.id} className="border shadow-none">
                    <CardHeader className="py-4 px-5 flex flex-row items-center justify-between gap-4">
                      <div className="space-y-1">
                        <CardTitle className="text-base">{job.title}</CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {total} candidature{total !== 1 ? "s" : ""} · {pending} en attente
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {total}
                      </Badge>
                    </CardHeader>
                    <CardContent className="py-3 px-5 border-t bg-muted/40 flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        Consultez et gérez les candidatures sur la page de l&apos;offre.
                      </p>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/${locale}/dashboard/salon/jobs/${job.id}`}>
                          Voir l&apos;offre
                          <ChevronRight className="h-3.5 w-3.5 ml-1" />
                        </Link>
                      </Button>
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
