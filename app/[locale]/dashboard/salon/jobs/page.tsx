export const dynamic = "force-dynamic";

import { getTranslations } from "next-intl/server";
import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Briefcase, ChevronRight, Clock } from "lucide-react";
import { SalonSidebar } from "@/components/dashboard/SalonSidebar";
import {
  getLang,
  POST_STATUS_LABEL,
  POST_STATUS_BADGE_VARIANT,
  EMPLOYMENT_TYPE_LABEL,
  getLabel,
} from "@/lib/labels";

export default async function SalonJobsIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await requireRole(locale, "SALON");

  const tDashboard = await getTranslations("dashboard.salon");
  const tJobs = await getTranslations("jobs");
  const lang = getLang(locale);

  const salon = await prisma.salonProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      name: true,
      jobPosts: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!salon) return null;

  // Auto-expire jobs past their expiresAt
  const now = new Date();
  const expiredIds: string[] = [];
  for (const job of salon.jobPosts) {
    if (job.status === "PUBLISHED" && job.expiresAt && job.expiresAt < now) {
      expiredIds.push(job.id);
      job.status = "EXPIRED";
    }
  }
  if (expiredIds.length > 0) {
    prisma.jobPost.updateMany({
      where: { id: { in: expiredIds } },
      data: { status: "EXPIRED" },
    }).catch((err) => console.error("[JOB EXPIRY] Batch update failed", err));
  }

  const activeJobs = salon.jobPosts.filter((j) => j.status === "PUBLISHED");
  const draftJobs = salon.jobPosts.filter((j) => j.status === "DRAFT");
  const otherJobs = salon.jobPosts.filter((j) =>
    j.status !== "PUBLISHED" && j.status !== "DRAFT",
  );

  function daysLeft(expiresAt: Date | null): string | null {
    if (!expiresAt) return null;
    const diff = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff <= 0) return null;
    return lang === "fr" ? `${diff} jour${diff > 1 ? "s" : ""} restant${diff > 1 ? "s" : ""}` : `${diff} day${diff > 1 ? "s" : ""} left`;
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <SalonSidebar locale={locale} salonName={salon.name} />

      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#1F2933]">{tDashboard("my_jobs")}</h1>
              <p className="text-sm text-muted-foreground">{tJobs("title")}</p>
            </div>
            <Button size="sm" asChild>
              <Link href={`/${locale}/dashboard/salon/jobs/new`}>
                {tDashboard("new_job")}
              </Link>
            </Button>
          </div>

          <Separator />

          {salon.jobPosts.length === 0 ? (
            <Card className="border-dashed shadow-none">
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                {tDashboard("no_jobs")}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Active jobs */}
              {activeJobs.length > 0 && (
                <section>
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    {lang === "fr" ? "Actives" : "Active"} ({activeJobs.length})
                  </h2>
                  <div className="space-y-3">
                    {activeJobs.map((job) => (
                      <JobCard key={job.id} job={job} locale={locale} lang={lang} daysLeftLabel={daysLeft(job.expiresAt)} />
                    ))}
                  </div>
                </section>
              )}

              {/* Draft jobs */}
              {draftJobs.length > 0 && (
                <section>
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    {lang === "fr" ? "Brouillons" : "Drafts"} ({draftJobs.length})
                  </h2>
                  <div className="space-y-3">
                    {draftJobs.map((job) => (
                      <JobCard key={job.id} job={job} locale={locale} lang={lang} daysLeftLabel={null} />
                    ))}
                  </div>
                </section>
              )}

              {/* Expired / Filled / Archived */}
              {otherJobs.length > 0 && (
                <section>
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    {lang === "fr" ? "Terminées" : "Ended"} ({otherJobs.length})
                  </h2>
                  <div className="space-y-3">
                    {otherJobs.map((job) => (
                      <JobCard key={job.id} job={job} locale={locale} lang={lang} daysLeftLabel={null} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function JobCard({
  job,
  locale,
  lang,
  daysLeftLabel,
}: {
  job: { id: string; title: string; city: string; employmentType: string; status: string };
  locale: string;
  lang: "fr" | "en";
  daysLeftLabel: string | null;
}) {
  return (
    <Link href={`/${locale}/dashboard/salon/jobs/${job.id}`} className="block">
      <Card className="border shadow-none hover:shadow-sm transition-shadow cursor-pointer">
        <CardContent className="py-4 px-5 flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
              <p className="font-medium truncate">{job.title}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{job.city} · {getLabel(EMPLOYMENT_TYPE_LABEL, job.employmentType, lang)}</span>
              {daysLeftLabel && (
                <span className="inline-flex items-center gap-1 text-xs text-primary">
                  <Clock className="h-3 w-3" />
                  {daysLeftLabel}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={POST_STATUS_BADGE_VARIANT[job.status] ?? "outline"}>
              {getLabel(POST_STATUS_LABEL, job.status, lang)}
            </Badge>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
