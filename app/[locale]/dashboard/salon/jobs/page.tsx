export const dynamic = "force-dynamic";

import { getTranslations } from "next-intl/server";
import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Briefcase, ChevronRight } from "lucide-react";
import { SalonSidebar } from "@/components/dashboard/SalonSidebar";

export default async function SalonJobsIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await requireRole(locale, "SALON");

  const tDashboard = await getTranslations("dashboard.salon");
  const tJobs = await getTranslations("jobs");

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

  return (
    <div className="flex min-h-screen bg-muted/30">
      <SalonSidebar locale={locale} salonName={salon.name} />

      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{tDashboard("my_jobs")}</h1>
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
            <div className="space-y-3">
              {salon.jobPosts.map((job) => (
                <Link
                  key={job.id}
                  href={`/${locale}/dashboard/salon/jobs/${job.id}`}
                  className="block"
                >
                  <Card className="border shadow-none hover:shadow-sm transition-shadow cursor-pointer">
                    <CardContent className="py-4 px-5 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                          <p className="font-medium truncate">{job.title}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {job.city} · {job.employmentType.replace("_", " ")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={job.status === "PUBLISHED" ? "default" : "secondary"}>
                          {job.status}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
