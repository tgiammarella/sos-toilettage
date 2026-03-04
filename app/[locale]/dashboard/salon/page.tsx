export const dynamic = "force-dynamic";

import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Scissors, Briefcase, CreditCard, Plus, Coins, ChevronRight } from "lucide-react";
import { SalonSidebar } from "@/components/dashboard/SalonSidebar";

export default async function SalonDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await requireRole(locale, "SALON");

  const t = await getTranslations("dashboard.salon");
  const tCommon = await getTranslations("dashboard");

  const salon = await prisma.salonProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      shiftPosts: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          _count: { select: { applications: { where: { status: "APPLIED" } } } },
        },
      },
      jobPosts: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!salon) notFound();

  return (
    <div className="flex min-h-screen bg-muted/40">
      <SalonSidebar locale={locale} salonName={salon.name} />

      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{tCommon("welcome")}, {salon.name} 👋</h1>
              <p className="text-muted-foreground text-sm mt-0.5">{t("title")}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link href={`/${locale}/dashboard/salon/jobs/new`}>
                  <Plus className="h-4 w-4 mr-1" />
                  {t("new_job")}
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href={`/${locale}/dashboard/salon/shifts/new`}>
                  <Plus className="h-4 w-4 mr-1" />
                  {t("new_shift")}
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<Scissors className="h-5 w-5 text-primary" />}
              label={t("my_shifts")}
              value={salon.shiftPosts.length}
            />
            <StatCard
              icon={<Briefcase className="h-5 w-5 text-primary" />}
              label={t("my_jobs")}
              value={salon.jobPosts.length}
            />
            <StatCard
              icon={<Coins className="h-5 w-5 text-primary" />}
              label={t("credits_available")}
              value={salon.creditsAvailable}
            />
            <StatCard
              icon={<CreditCard className="h-5 w-5 text-primary" />}
              label={t("subscription")}
              value={<PlanBadge plan={salon.subscriptionPlan} status={salon.subscriptionStatus} />}
            />
          </div>

          <Separator />

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{t("my_shifts")}</h2>
              <Button size="sm" asChild>
                <Link href={`/${locale}/dashboard/salon/shifts/new`}>
                  <Plus className="h-4 w-4 mr-1" /> {t("new_shift")}
                </Link>
              </Button>
            </div>
            {salon.shiftPosts.length === 0 ? (
              <EmptyState message={t("no_shifts")} />
            ) : (
              <div className="space-y-3">
                {salon.shiftPosts.map((shift) => {
                  const pendingCount = shift._count.applications;
                  return (
                    <Link key={shift.id} href={`/${locale}/dashboard/salon/shifts/${shift.id}`}>
                      <Card className="border shadow-none hover:shadow-sm transition-shadow cursor-pointer">
                        <CardContent className="py-4 px-5 flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {shift.city} — {new Date(shift.date).toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA")}
                            </p>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {shift.startTime} · {shift.numberOfAppointments} rdv
                              {pendingCount > 0 && (
                                <span className="ml-2 text-primary font-medium">
                                  {pendingCount} candidature{pendingCount !== 1 ? "s" : ""}
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {shift.isUrgent && (
                              <Badge variant="destructive" className="text-xs">URGENT</Badge>
                            )}
                            <StatusBadge status={shift.status} locale={locale} />
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{t("my_jobs")}</h2>
              <Button size="sm" asChild>
                <Link href={`/${locale}/dashboard/salon/jobs/new`}>
                  <Plus className="h-4 w-4 mr-1" /> {t("new_job")}
                </Link>
              </Button>
            </div>
            {salon.jobPosts.length === 0 ? (
              <EmptyState message={t("no_jobs")} />
            ) : (
              <div className="space-y-3">
                {salon.jobPosts.map((job) => (
                  <Link key={job.id} href={`/${locale}/dashboard/salon/jobs/${job.id}`} className="block">
                    <Card className="border shadow-none hover:shadow-sm transition-shadow cursor-pointer">
                      <CardContent className="py-4 px-5 flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{job.title}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {job.city} · {job.employmentType.replace("_", " ")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <StatusBadge status={job.status} locale={locale} />
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <Card className="border shadow-none">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {icon}
          <span>{label}</span>
        </div>
      </CardHeader>
      <CardContent className="pb-4 px-4">
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function PlanBadge({ plan, status }: { plan: string; status: string }) {
  const active = status === "ACTIVE";
  if (plan === "NONE" || !active) return <span className="text-muted-foreground text-sm">—</span>;
  return (
    <Badge className="text-sm" variant={plan === "PRO" ? "default" : "secondary"}>
      {plan}
    </Badge>
  );
}

function StatusBadge({ status, locale }: { status: string; locale: string }) {
  const map: Record<string, { label: Record<string, string>; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    DRAFT:     { label: { fr: "Brouillon", en: "Draft" },     variant: "outline" },
    PUBLISHED: { label: { fr: "Publié",    en: "Published" }, variant: "default" },
    FILLED:    { label: { fr: "Comblé",    en: "Filled" },    variant: "secondary" },
    ARCHIVED:  { label: { fr: "Archivé",   en: "Archived" },  variant: "outline" },
  };
  const item = map[status] ?? map.DRAFT;
  return <Badge variant={item.variant}>{item.label[locale] ?? status}</Badge>;
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card className="border-dashed shadow-none">
      <CardContent className="py-10 text-center text-muted-foreground text-sm">
        {message}
      </CardContent>
    </Card>
  );
}
