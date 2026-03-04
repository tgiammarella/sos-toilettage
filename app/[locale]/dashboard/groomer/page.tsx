export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Upload, Pencil, FileText, CheckCircle2 } from "lucide-react";
import { GroomerSidebar } from "@/components/dashboard/GroomerSidebar";

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
              <h1 className="text-2xl font-bold">{tCommon("welcome")}, {groomer.fullName} 👋</h1>
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
                    <Badge variant="outline" className="text-xs border-amber-400 text-amber-600">
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
                      <Badge key={s} variant="secondary" className="text-xs">
                        {SPEC_LABELS[s]?.[locale === "fr" ? "fr" : "en"] ?? s}
                      </Badge>
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
                      className="inline-flex items-center gap-1.5 text-xs text-green-600 hover:underline"
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
                <CardContent className="py-10 text-center text-muted-foreground text-sm">
                  {t("no_applications")}
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

function CardHeaderSimple({ children }: { children: React.ReactNode }) {
  return <CardHeader className="pb-2 pt-4 px-4">{children}</CardHeader>;
}
// suppress unused warning
void CardHeaderSimple;
