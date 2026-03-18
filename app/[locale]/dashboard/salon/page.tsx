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
import { Scissors, Briefcase, CreditCard, Plus, Coins, ChevronRight, BarChart3, CheckCircle2, Radio, TrendingUp } from "lucide-react";
import { SalonSidebar } from "@/components/dashboard/SalonSidebar";
import { getLang, EMPLOYMENT_TYPE_LABEL, getLabel } from "@/lib/labels";

export default async function SalonDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await requireRole(locale, "SALON");

  const t = await getTranslations("dashboard.salon");
  const tCommon = await getTranslations("dashboard");
  const lang = getLang(locale);

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

  // Performance stats — counts across ALL shifts, not just latest 5
  const [totalPosted, filledCount, completedCount, publishedCount, lastFilled] = await Promise.all([
    prisma.shiftPost.count({ where: { salonId: salon.id } }),
    prisma.shiftPost.count({ where: { salonId: salon.id, status: "FILLED" } }),
    prisma.shiftPost.count({ where: { salonId: salon.id, status: "COMPLETED" } }),
    prisma.shiftPost.count({ where: { salonId: salon.id, status: "PUBLISHED" } }),
    prisma.shiftPost.findFirst({
      where: { salonId: salon.id, status: { in: ["FILLED", "COMPLETED"] }, filledAt: { not: null } },
      orderBy: { filledAt: "desc" },
      select: { publishedAt: true, filledAt: true },
    }),
  ]);

  const filledOrCompleted = filledCount + completedCount;
  const fillRate = totalPosted > 0 ? Math.round((filledOrCompleted / totalPosted) * 100) : 0;

  // Time-to-fill for the most recent filled shift
  let fillTimeLabel: string | null = null;
  if (lastFilled?.publishedAt && lastFilled.filledAt) {
    const diffMs = lastFilled.filledAt.getTime() - lastFilled.publishedAt.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) {
      fillTimeLabel = lang === "fr" ? "moins d'1 heure" : "less than 1 hour";
    } else if (diffHours < 24) {
      fillTimeLabel = lang === "fr" ? `${diffHours} heure${diffHours > 1 ? "s" : ""}` : `${diffHours} hour${diffHours > 1 ? "s" : ""}`;
    } else {
      const days = Math.round(diffHours / 24);
      fillTimeLabel = lang === "fr" ? `${days} jour${days > 1 ? "s" : ""}` : `${days} day${days > 1 ? "s" : ""}`;
    }
  }

  return (
    <div className="flex min-h-screen bg-muted/40">
      <SalonSidebar locale={locale} salonName={salon.name} />

      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1F2933]">{tCommon("welcome")}, {salon.name} 👋</h1>
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
              value={<PlanBadge planKey={salon.planKey} />}
            />
          </div>

          {/* ── Performance widget ── */}
          <section>
            <h2 className="text-lg font-semibold mb-3">
              {lang === "fr" ? "État de vos remplacements" : "Shift Performance"}
            </h2>
            {totalPosted === 0 ? (
              <Card className="border-dashed shadow-none">
                <CardContent className="py-8 text-center text-muted-foreground text-sm">
                  {lang === "fr"
                    ? "Aucun remplacement publié pour le moment."
                    : "No shifts posted yet."}
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard
                    icon={<BarChart3 className="h-5 w-5 text-primary" />}
                    label={lang === "fr" ? "Publiés" : "Posted"}
                    value={totalPosted}
                  />
                  <StatCard
                    icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                    label={lang === "fr" ? "Comblés" : "Filled"}
                    value={filledOrCompleted}
                  />
                  <StatCard
                    icon={<Radio className="h-5 w-5 text-blue-500" />}
                    label={lang === "fr" ? "Actifs" : "Active"}
                    value={publishedCount}
                  />
                  <StatCard
                    icon={<TrendingUp className="h-5 w-5 text-amber-500" />}
                    label={lang === "fr" ? "Taux de comblement" : "Fill rate"}
                    value={`${fillRate} %`}
                  />
                </div>
                {fillTimeLabel && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {lang === "fr"
                      ? `Votre dernier remplacement a été comblé en ${fillTimeLabel}.`
                      : `Your last shift was filled in ${fillTimeLabel}.`}
                  </p>
                )}
              </>
            )}
          </section>

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
                      <Card className={`border shadow-none hover:shadow-sm transition-shadow cursor-pointer ${shift.isUrgent ? "border-destructive/40" : ""}`}>
                        <CardContent className="py-4 px-5 flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {shift.city} — {new Date(shift.date).toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA")}
                            </p>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {shift.startTime} · {shift.numberOfAppointments} rdv
                              {pendingCount > 0 && (
                                <span className="ml-2 text-primary font-medium">
                                  {pendingCount}{" "}
                                  {lang === "fr"
                                    ? `candidature${pendingCount !== 1 ? "s" : ""}`
                                    : `applicant${pendingCount !== 1 ? "s" : ""}`}
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
                            {job.city} · {getLabel(EMPLOYMENT_TYPE_LABEL, job.employmentType, lang)}
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

function PlanBadge({ planKey }: { planKey: string }) {
  const labels: Record<string, string> = {
    ESSENTIEL: "Essentiel",
    SALON:     "Salon",
    RESEAU:    "Réseau",
    CHAINE:    "Chaîne",
  };
  if (planKey === "NONE" || !labels[planKey]) {
    return <span className="text-muted-foreground text-sm">—</span>;
  }
  return <Badge className="text-sm">{labels[planKey]}</Badge>;
}

function StatusBadge({ status, locale }: { status: string; locale: string }) {
  const map: Record<string, { label: Record<string, string>; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    DRAFT:     { label: { fr: "Brouillon", en: "Draft" },     variant: "outline" },
    PUBLISHED: { label: { fr: "Publié",    en: "Published" }, variant: "default" },
    FILLED:    { label: { fr: "Comblé",    en: "Filled" },    variant: "secondary" },
    COMPLETED: { label: { fr: "Complété",  en: "Completed" }, variant: "default" },
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
