export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Upload, Pencil, FileText, CheckCircle2, Scissors, Briefcase, BookOpen, ArrowRight, MapPin, Clock, DollarSign, AlertTriangle, Target, ClipboardList, ShieldCheck, Star, TrendingUp, Zap } from "lucide-react";
import { GroomerSidebar } from "@/components/dashboard/GroomerSidebar";
import { QuickApplyButton } from "@/components/shifts/QuickApplyButton";

const SPEC_LABELS: Record<string, { fr: string; en: string }> = {
  AGGRESSIVE_DOGS: { fr: "Chiens agressifs", en: "Aggressive dogs" },
  COLOR: { fr: "Coloration", en: "Color" },
  BIG_DOGS: { fr: "Grands chiens", en: "Big dogs" },
  RABBITS: { fr: "Lapins", en: "Rabbits" },
  CATS: { fr: "Chats", en: "Cats" },
  SPECIALTY_CUTS: { fr: "Coupes spécialisées", en: "Specialty cuts" },
};

export default async function GroomerDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await requireRole(locale, "GROOMER");

  const t = await getTranslations("dashboard.groomer");
  const tCommon = await getTranslations("dashboard");

  const groomer = await prisma.groomerProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      applications: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          shiftPost: { select: { city: true, date: true, startTime: true, salon: { select: { name: true } } } },
          jobPost: { select: { title: true, city: true, salon: { select: { name: true } } } },
        },
      },
      engagements: { orderBy: { startsAt: "desc" }, take: 5 },
    },
  });

  if (!groomer) notFound();

  const lang = locale === "fr" ? "fr" : "en";

  // ── Summary widget data ──
  const [
    availableShiftsCount,
    urgentShiftsCount,
    availableJobsCount,
    totalApps,
    acceptedApps,
    pendingApps,
    rejectedApps,
    completedShifts,
    reviewCount,
  ] = await Promise.all([
    prisma.shiftPost.count({ where: { status: "PUBLISHED", date: { gte: new Date() } } }),
    prisma.shiftPost.count({ where: { status: "PUBLISHED", date: { gte: new Date() }, isUrgent: true } }),
    prisma.jobPost.count({ where: { status: "PUBLISHED" } }),
    prisma.application.count({ where: { groomerId: groomer.id } }),
    prisma.application.count({ where: { groomerId: groomer.id, status: "ACCEPTED" } }),
    prisma.application.count({ where: { groomerId: groomer.id, status: "APPLIED" } }),
    prisma.application.count({ where: { groomerId: groomer.id, status: "REJECTED" } }),
    prisma.engagement.count({ where: { groomerId: groomer.id, shiftPost: { status: "COMPLETED" } } }),
    prisma.review.count({ where: { subjectGroomerId: groomer.id } }),
  ]);

  // Fetch upcoming available shifts — fail safely so the rest of the dashboard still renders
  type ShiftWithSalon = Awaited<ReturnType<typeof prisma.shiftPost.findMany<{
    include: { salon: { select: { name: true } } };
  }>>>;
  let nearbyShifts: ShiftWithSalon = [];
  try {
    nearbyShifts = await prisma.shiftPost.findMany({
      where: { status: "PUBLISHED", date: { gte: new Date() } },
      orderBy: [{ isUrgent: "desc" }, { date: "asc" }],
      take: 5,
      include: { salon: { select: { name: true } } },
    });
  } catch (err) {
    console.error("[GroomerDashboard] Failed to load nearby shifts:", err);
  }

  // Collect shift IDs this groomer has already applied to
  const appliedShiftIds = new Set<string>();
  const existingApps = await prisma.application.findMany({
    where: { groomerId: groomer.id, shiftPostId: { not: null } },
    select: { shiftPostId: true },
  });
  existingApps.forEach((a) => { if (a.shiftPostId) appliedShiftIds.add(a.shiftPostId); });

  const specs: string[] = JSON.parse(groomer.specializations || "[]");
  const profileComplete = !!groomer.bio && specs.length > 0;

  return (
    <div className="flex min-h-screen bg-muted/40">
      <GroomerSidebar locale={locale} groomerName={groomer.fullName} />

      {/* Main */}
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1F2933]">{tCommon("welcome")}, {groomer.fullName} 👋</h1>
              <p className="text-muted-foreground text-sm mt-0.5">{t("title")}</p>
            </div>
          </div>

          {/* Profile card */}
          <Card className="border shadow-none">
            <CardContent className="py-6 px-6 flex items-start gap-5">
              <Avatar className="h-16 w-16 shrink-0">
                <AvatarImage src={groomer.photoUrl ?? ""} alt={groomer.fullName} />
                <AvatarFallback className="text-xl font-semibold bg-primary/10 text-primary">
                  {groomer.fullName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="font-semibold text-lg">{groomer.fullName}</p>
                  {!profileComplete && (
                    <Badge variant="outline" className="text-xs border-warning-border text-warning-foreground">
                      Profil incomplet
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {groomer.city} · {groomer.yearsExperience} {locale === "fr" ? "an(s) d'expérience" : "year(s) experience"}
                </p>
                {specs.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {specs.map((s) => (
                      <span key={s} className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium bg-[#F6EFE6] text-[#055864]">
                        {SPEC_LABELS[s]?.[locale === "fr" ? "fr" : "en"] ?? s}
                      </span>
                    ))}
                  </div>
                )}
                {/* CV status */}
                <div className="mt-2">
                  {groomer.cvFileUrl ? (
                    <a
                      href={groomer.cvFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-success-foreground hover:underline"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {locale === "fr" ? "CV téléversé — Ouvrir" : "CV uploaded — Open"}
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <FileText className="h-3.5 w-3.5" />
                      {locale === "fr" ? "Aucun CV téléversé" : "No CV uploaded"}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/${locale}/dashboard/groomer/profile`}>
                    <Pencil className="h-3.5 w-3.5 mr-1" />
                    {t("edit_profile")}
                  </Link>
                </Button>
                {!groomer.cvFileUrl && (
                  <Button size="sm" variant="ghost" asChild>
                    <Link href={`/${locale}/dashboard/groomer/profile`}>
                      <Upload className="h-3.5 w-3.5 mr-1" />
                      {t("upload_cv")}
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ── Summary widgets ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Widget 1: Opportunities */}
            <Card className="border shadow-none">
              <CardContent className="py-5 px-5 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Target className="h-4 w-4 text-primary" />
                  </div>
                  <p className="font-semibold text-sm">
                    {lang === "fr" ? "Opportunités pour vous" : "Opportunities for you"}
                  </p>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Scissors className="h-3.5 w-3.5" />
                      {lang === "fr" ? "Remplacements" : "Shifts"}
                    </span>
                    <span className="font-semibold">{availableShiftsCount}</span>
                  </div>
                  {urgentShiftsCount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-destructive flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5" />
                        {lang === "fr" ? "Urgents" : "Urgent"}
                      </span>
                      <Badge variant="destructive" className="text-xs">{urgentShiftsCount}</Badge>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5" />
                      {lang === "fr" ? "Offres d'emploi" : "Job offers"}
                    </span>
                    <span className="font-semibold">{availableJobsCount}</span>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="w-full mt-1" asChild>
                  <Link href={`/${locale}/shifts`}>
                    {lang === "fr" ? "Voir les opportunités" : "Browse opportunities"}
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Widget 2: My applications */}
            <Card className="border shadow-none">
              <CardContent className="py-5 px-5 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <ClipboardList className="h-4 w-4 text-primary" />
                  </div>
                  <p className="font-semibold text-sm">
                    {lang === "fr" ? "Mes candidatures" : "My applications"}
                  </p>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {lang === "fr" ? "Total" : "Total"}
                    </span>
                    <span className="font-semibold">{totalApps}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      {lang === "fr" ? "Acceptées" : "Accepted"}
                    </span>
                    <span className="font-semibold text-emerald-600">{acceptedApps}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-amber-500" />
                      {lang === "fr" ? "En attente" : "Pending"}
                    </span>
                    <span className="font-semibold text-amber-600">{pendingApps}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {lang === "fr" ? "Non retenues" : "Rejected"}
                    </span>
                    <span className="font-semibold text-muted-foreground">{rejectedApps}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Widget 3: Reliability */}
            <Card className="border shadow-none">
              <CardContent className="py-5 px-5 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                  </div>
                  <p className="font-semibold text-sm">
                    {lang === "fr" ? "Ma fiabilité" : "My reliability"}
                  </p>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5 text-amber-400" />
                      {lang === "fr" ? "Score" : "Score"}
                    </span>
                    <span className="font-semibold">
                      {groomer.reliabilityScore > 0
                        ? `${groomer.reliabilityScore.toFixed(1)} / 5`
                        : (lang === "fr" ? "—" : "—")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5" />
                      {lang === "fr" ? "Remplacements complétés" : "Completed shifts"}
                    </span>
                    <span className="font-semibold">{completedShifts}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5" />
                      {lang === "fr" ? "Avis reçus" : "Reviews received"}
                    </span>
                    <span className="font-semibold">{reviewCount}</span>
                  </div>
                </div>
                {groomer.reliabilityScore === 0 && (
                  <p className="text-xs text-muted-foreground">
                    {lang === "fr"
                      ? "Complétez des remplacements pour bâtir votre score."
                      : "Complete shifts to build your score."}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Discover opportunities */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Découvrir des opportunités</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href={`/${locale}/shifts`} className="group block">
                <Card className="border shadow-none h-full transition-colors group-hover:border-primary/40 group-hover:bg-primary/5">
                  <CardContent className="py-6 px-5 flex flex-col items-start gap-3">
                    <div className="rounded-lg bg-primary/10 p-2.5">
                      <Scissors className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Remplacements</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Trouvez des remplacements disponibles près de chez vous.
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-primary mt-auto">
                      Voir les remplacements
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </CardContent>
                </Card>
              </Link>

              <Link href={`/${locale}/jobs`} className="group block">
                <Card className="border shadow-none h-full transition-colors group-hover:border-primary/40 group-hover:bg-primary/5">
                  <CardContent className="py-6 px-5 flex flex-col items-start gap-3">
                    <div className="rounded-lg bg-primary/10 p-2.5">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Offres d&apos;emploi</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Consultez les postes permanents et temporaires dans les salons.
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-primary mt-auto">
                      Voir les offres
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </CardContent>
                </Card>
              </Link>

              <Link href={`/${locale}/schools`} className="group block">
                <Card className="border shadow-none h-full transition-colors group-hover:border-primary/40 group-hover:bg-primary/5">
                  <CardContent className="py-6 px-5 flex flex-col items-start gap-3">
                    <div className="rounded-lg bg-primary/10 p-2.5">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Formations</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Découvrez les écoles et formations en toilettage.
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-primary mt-auto">
                      Voir les formations
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </section>

          {/* Nearby shifts */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Remplacements disponibles</h2>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/${locale}/shifts`}>Voir tout</Link>
              </Button>
            </div>

            {nearbyShifts.length === 0 ? (
              <Card className="border-dashed shadow-none">
                <CardContent className="py-10 text-center space-y-3">
                  <p className="text-muted-foreground text-sm">
                    Aucun remplacement disponible pour le moment.
                  </p>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/${locale}/shifts`}>Voir tous les remplacements</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {nearbyShifts.map((shift) => (
                  <Card key={shift.id} className={`border shadow-none bg-white ${shift.isUrgent ? "border-l-[3px] border-l-[#dc2626] border-border/80" : ""}`}>
                    <CardContent className="py-4 px-5 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          {shift.isUrgent && (
                            <Badge variant="destructive" className="text-xs font-bold flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              URGENT
                            </Badge>
                          )}
                          <p className="font-medium truncate">{shift.salon.name}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {shift.city}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(shift.date).toLocaleDateString("fr-CA")} à {shift.startTime}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <DollarSign className="h-3.5 w-3.5" />
                            {(shift.payRateCents / 100).toFixed(2)} $ / {shift.payType === "HOURLY" ? "h" : "forfait"}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <QuickApplyButton
                          shiftId={shift.id}
                          alreadyApplied={appliedShiftIds.has(shift.id)}
                          locale={locale}
                        />
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/${locale}/shifts/${shift.id}`}>
                            {lang === "fr" ? "Voir détails" : "View details"}
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <Separator />

          {/* Recent applications */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{t("my_applications")}</h2>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/${locale}/shifts`}>Voir les remplacements</Link>
              </Button>
            </div>

            {groomer.applications.length === 0 ? (
              <Card className="border-dashed shadow-none">
                <CardContent className="py-10 text-center space-y-3">
                  <p className="text-muted-foreground text-sm">{t("no_applications")}</p>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/${locale}/shifts`}>Voir les remplacements</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {groomer.applications.map((app) => {
                  const isShift = app.postType === "SHIFT";
                  const title = isShift
                    ? `${app.shiftPost?.salon?.name ?? "Salon"} — ${app.shiftPost?.city}`
                    : `${app.jobPost?.title} — ${app.jobPost?.city}`;
                  const sub = isShift
                    ? app.shiftPost?.date
                      ? new Date(app.shiftPost.date).toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA")
                      : ""
                    : app.jobPost?.salon?.name ?? "";

                  return (
                    <Card key={app.id} className="border shadow-none">
                      <CardContent className="py-4 px-5 flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{title}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">{sub}</p>
                        </div>
                        <AppStatusBadge status={app.status} locale={locale} />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function AppStatusBadge({ status, locale }: { status: string; locale: string }) {
  const map: Record<string, { label: Record<string, string>; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    APPLIED:   { label: { fr: "En attente",  en: "Pending" },   variant: "outline" },
    ACCEPTED:  { label: { fr: "Accepté",     en: "Accepted" },  variant: "default" },
    REJECTED:  { label: { fr: "Non retenu",  en: "Not selected" }, variant: "secondary" },
    WITHDRAWN: { label: { fr: "Retiré",      en: "Withdrawn" }, variant: "outline" },
  };
  const item = map[status] ?? map.APPLIED;
  return <Badge variant={item.variant}>{item.label[locale] ?? status}</Badge>;
}
