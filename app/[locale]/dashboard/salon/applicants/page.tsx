export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText, ChevronRight, Star } from "lucide-react";
import { SalonSidebar } from "@/components/dashboard/SalonSidebar";
import { getLang, SPEC_LABEL, getLabel } from "@/lib/labels";
import { computeTrustBadges } from "@/lib/groomer-trust";

// ─── Label maps ────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, { fr: string; en: string }> = {
  APPLIED:   { fr: "En attente",   en: "Pending" },
  ACCEPTED:  { fr: "Accepté",      en: "Accepted" },
  REJECTED:  { fr: "Non retenu",   en: "Rejected" },
  WITHDRAWN: { fr: "Retiré",       en: "Withdrawn" },
};

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  APPLIED:   "outline",
  ACCEPTED:  "default",
  REJECTED:  "secondary",
  WITHDRAWN: "outline",
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function SalonApplicantsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ filter?: string }>;
}) {
  const { locale } = await params;
  const { filter: filterParam } = await searchParams;
  const filter = filterParam === "jobs" ? "jobs" : "shifts";

  const session = await requireRole(locale, "SALON");
  const lang = locale === "en" ? "en" : "fr";

  const salon = await prisma.salonProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, name: true },
  });
  if (!salon) notFound();

  // Fetch both tabs' counts + active tab's full data in parallel
  const [shiftApps, jobApps] = await Promise.all([
    prisma.application.findMany({
      where: { postType: "SHIFT", salonId: salon.id },
      include: {
        shiftPost: {
          select: { id: true, city: true, date: true, startTime: true },
        },
        groomer: {
          select: {
            id: true,
            fullName: true,
            city: true,
            yearsExperience: true,
            specializations: true,
            bio: true,
            cvFileUrl: true,
            photoUrl: true,
            reviewsReceived: { select: { rating: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.application.findMany({
      where: { postType: "JOB", salonId: salon.id },
      include: {
        jobPost: { select: { id: true, title: true } },
        groomer: {
          select: {
            id: true,
            fullName: true,
            city: true,
            yearsExperience: true,
            specializations: true,
            bio: true,
            cvFileUrl: true,
            photoUrl: true,
            reviewsReceived: { select: { rating: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const activeApps = filter === "jobs" ? jobApps : shiftApps;

  const baseHref = `/${locale}/dashboard/salon/applicants`;
  const shiftsHref = baseHref; // default tab
  const jobsHref = `${baseHref}?filter=jobs`;

  return (
    <div className="flex min-h-screen bg-muted/30">
      <SalonSidebar locale={locale} salonName={salon.name} />

      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="max-w-5xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1F2933]">
              {lang === "fr" ? "Candidats" : "Applicants"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {lang === "fr"
                ? "Gérez les candidatures reçues."
                : "Manage received applications."}
            </p>
          </div>

          <Separator />

          {/* Tab bar */}
          <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
            <Link
              href={shiftsHref}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === "shifts"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {lang === "fr" ? "Remplacements" : "Shifts"}
              {shiftApps.length > 0 && (
                <Badge variant="secondary" className="text-xs h-5 px-1.5">
                  {shiftApps.length}
                </Badge>
              )}
            </Link>
            <Link
              href={jobsHref}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === "jobs"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {lang === "fr" ? "Offres d'emploi" : "Job offers"}
              {jobApps.length > 0 && (
                <Badge variant="secondary" className="text-xs h-5 px-1.5">
                  {jobApps.length}
                </Badge>
              )}
            </Link>
          </div>

          {/* Content */}
          {activeApps.length === 0 ? (
            <Card className="border-dashed shadow-none">
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                {filter === "shifts"
                  ? lang === "fr"
                    ? "Aucune candidature reçue pour vos remplacements."
                    : "No applications received for your shifts."
                  : lang === "fr"
                  ? "Aucune candidature reçue pour vos offres d'emploi."
                  : "No applications received for your job offers."}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filter === "shifts"
                ? shiftApps.map((app) => {
                    const dateStr = app.shiftPost?.date
                      ? new Date(app.shiftPost.date).toLocaleDateString(
                          locale === "fr" ? "fr-CA" : "en-CA",
                          { year: "numeric", month: "short", day: "numeric" }
                        )
                      : "";
                    const postTitle = app.shiftPost
                      ? `${app.shiftPost.city} — ${dateStr}`
                      : "—";
                    const detailHref = app.shiftPost
                      ? `/${locale}/dashboard/salon/shifts/${app.shiftPost.id}`
                      : undefined;

                    return (
                      <ApplicantCard
                        key={app.id}
                        groomer={app.groomer}
                        postTitle={postTitle}
                        postSub={app.shiftPost?.startTime ?? ""}
                        status={app.status}
                        shortlisted={false}
                        detailHref={detailHref}
                        lang={lang}
                        locale={locale}
                      />
                    );
                  })
                : jobApps.map((app) => {
                    const postTitle = app.jobPost?.title ?? "—";
                    const detailHref = app.jobPost
                      ? `/${locale}/dashboard/salon/jobs/${app.jobPost.id}`
                      : undefined;

                    return (
                      <ApplicantCard
                        key={app.id}
                        groomer={app.groomer}
                        postTitle={postTitle}
                        postSub=""
                        status={app.status}
                        shortlisted={app.shortlisted}
                        detailHref={detailHref}
                        lang={lang}
                        locale={locale}
                      />
                    );
                  })}

            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ─── Applicant card ────────────────────────────────────────────────────────────

function ApplicantCard({
  groomer,
  postTitle,
  postSub,
  status,
  shortlisted,
  detailHref,
  lang,
  locale,
}: {
  groomer: {
    id: string;
    fullName: string;
    city: string;
    yearsExperience: number;
    specializations: string;
    bio: string | null;
    cvFileUrl: string | null;
    photoUrl: string | null;
    reviewsReceived: { rating: number }[];
  };
  postTitle: string;
  postSub: string;
  status: string;
  shortlisted: boolean;
  detailHref?: string;
  lang: "fr" | "en";
  locale: string;
}) {
  const specs: string[] = (() => {
    try { return JSON.parse(groomer.specializations || "[]"); } catch { return []; }
  })();

  const reviewCount = groomer.reviewsReceived.length;
  const reviewAverage =
    reviewCount > 0
      ? groomer.reviewsReceived.reduce((s, r) => s + r.rating, 0) / reviewCount
      : 0;

  const badges = computeTrustBadges(
    {
      cvFileUrl: groomer.cvFileUrl,
      photoUrl: groomer.photoUrl,
      bio: groomer.bio,
      city: groomer.city,
      specializations: groomer.specializations,
      yearsExperience: groomer.yearsExperience,
    },
    { count: reviewCount, average: reviewAverage },
  );

  const profileHref = `/${locale}/groomers/${groomer.id}`;

  return (
    <Card className="border shadow-none">
      <CardContent className="py-4 px-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={groomer.photoUrl ?? ""} alt={groomer.fullName} />
            <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
              {groomer.fullName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center flex-wrap gap-2">
              <Link href={profileHref} className="font-medium hover:underline">
                {groomer.fullName}
              </Link>
              <Badge variant={STATUS_VARIANT[status] ?? "outline"} className="text-xs">
                {STATUS_LABEL[status]?.[lang] ?? status}
              </Badge>
              {shortlisted && (
                <Badge variant="outline" className="text-xs border-warning-border text-warning-foreground">
                  {lang === "fr" ? "Présélectionné" : "Shortlisted"}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              <span>
                {groomer.city} · {groomer.yearsExperience}{" "}
                {lang === "fr" ? "an(s) d'expérience" : "yr(s) experience"}
              </span>
              {reviewCount > 0 && (
                <span className="flex items-center gap-0.5">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {reviewAverage.toFixed(1)}
                  <span className="text-muted-foreground/60">({reviewCount})</span>
                </span>
              )}
            </div>
            {specs.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-0.5">
                {specs.slice(0, 3).map((s) => (
                  <Badge key={s} variant="secondary" className="text-xs">
                    {getLabel(SPEC_LABEL, s, lang)}
                  </Badge>
                ))}
                {specs.length > 3 && (
                  <Badge variant="secondary" className="text-xs">+{specs.length - 3}</Badge>
                )}
              </div>
            )}
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-0.5">
                {badges.map((b) => (
                  <Badge key={b.key} variant="outline" className="text-xs text-primary border-primary/30">
                    {lang === "fr" ? b.labelFr : b.labelEn}
                  </Badge>
                ))}
              </div>
            )}
            {groomer.bio ? (
              <p className="text-xs text-muted-foreground pt-0.5 line-clamp-2">{groomer.bio}</p>
            ) : (
              <p className="text-xs text-muted-foreground/60 pt-0.5 italic">
                {lang === "fr" ? "Aucune bio fournie" : "No bio provided"}
              </p>
            )}
            <p className="text-xs text-muted-foreground pt-0.5">
              {lang === "fr" ? "Pour :" : "For:"}{" "}
              <span className="font-medium text-foreground">{postTitle}</span>
              {postSub && <> · {postSub}</>}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            {groomer.cvFileUrl && (
              <a
                href={groomer.cvFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <FileText className="h-3.5 w-3.5" />
                CV
              </a>
            )}
            {detailHref && (
              <Button size="sm" variant="outline" asChild>
                <Link href={detailHref}>
                  {lang === "fr" ? "Voir" : "View"}
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
