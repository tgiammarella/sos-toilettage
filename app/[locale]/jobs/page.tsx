export const dynamic = "force-dynamic";

import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/nav/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Briefcase } from "lucide-react";
import Link from "next/link";

export default async function JobsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("jobs");

  const jobs = await prisma.jobPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    include: {
      salon: { select: { name: true } },
    },
  });

  const employmentLabels: Record<string, Record<string, string>> = {
    FULL_TIME: { fr: "Temps plein", en: "Full-time" },
    PART_TIME: { fr: "Temps partiel", en: "Part-time" },
    CONTRACT:  { fr: "Contrat", en: "Contract" },
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-10 max-w-5xl">
          <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
          <p className="text-muted-foreground mb-8 text-sm">
            {jobs.length} offre{jobs.length !== 1 ? "s" : ""} disponible{jobs.length !== 1 ? "s" : ""}
          </p>

          {jobs.length === 0 ? (
            <Card className="border-dashed bg-card/80">
              <CardContent className="py-16 text-center text-muted-foreground">
                {t("no_jobs")}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <Link key={job.id} href={`/${locale}/jobs/${job.id}`} className="block group">
                  <Card className="border border-border/80 bg-card/95 shadow-sm group-hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="py-5 px-6">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="font-semibold text-base group-hover:text-primary transition-colors">
                              {job.title}
                            </span>
                          </div>

                          <p className="text-sm font-medium text-muted-foreground">{job.salon.name}</p>

                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            {job.city}, {job.region}
                          </div>

                          <div className="flex flex-wrap gap-2 mt-3">
                            <Badge variant="secondary" className="text-xs">
                              {employmentLabels[job.employmentType]?.[locale] ?? job.employmentType}
                            </Badge>
                            {job.payInfo && (
                              <Badge variant="outline" className="text-xs">{job.payInfo}</Badge>
                            )}
                          </div>

                          {job.description && (
                            <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{job.description}</p>
                          )}
                        </div>

                        <div className="shrink-0 self-center">
                          <span className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
                            {t("view_job")}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
