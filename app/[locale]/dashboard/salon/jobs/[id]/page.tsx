export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { JobDecisionButtons } from "@/components/jobs/JobDecisionButtons";
import { ShortlistButton } from "@/components/jobs/ShortlistButton";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  CheckCircle,
  CalendarDays,
  MessageSquare,
  Clock,
  Pencil,
  FileText,
} from "lucide-react";
import { SalonSidebar } from "@/components/dashboard/SalonSidebar";
import { PublishJobButton } from "@/components/jobs/PublishJobButton";
import {
  getLang,
  POST_STATUS_LABEL,
  POST_STATUS_BADGE_CLASS,
  EMPLOYMENT_TYPE_LABEL,
  APP_STATUS_LABEL,
  APP_STATUS_VARIANT,
  SPEC_LABEL,
  getLabel,
} from "@/lib/labels";
import {
  canViewFullGroomerProfile,
  extractFirstName,
  getSalonAccessProfile,
} from "@/lib/groomer-access";

export default async function SalonJobDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ filter?: string }>;
}) {
  const { locale, id } = await params;
  const { filter } = await searchParams;
  const session = await requireRole(locale, "SALON");
  const lang = getLang(locale);

  const salon = await prisma.salonProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, name: true },
  });

  if (!salon) notFound();

  // Check groomer profile access level
  const salonAccess = await getSalonAccessProfile(session.user.id);
  const hasFullAccess = canViewFullGroomerProfile(salonAccess, session.user.role);

  const job = await prisma.jobPost.findUnique({
    where: { id },
    include: {
      applications: {
        orderBy: { createdAt: "asc" },
        include: {
          groomer: {
            select: {
              id: true,
              fullName: true,
              city: true,
              yearsExperience: true,
              specializations: true,
              bio: true,
              cvFileUrl: true,
            },
          },
        },
      },
      engagement: {
        include: { groomer: { select: { fullName: true } } },
      },
    },
  });

  if (!job || job.salonId !== salon.id) notFound();

  const allApps = job.applications;
  const filteredApps =
    filter === "shortlisted"
      ? allApps.filter((a) => a.shortlisted)
      : filter === "not_shortlisted"
      ? allApps.filter((a) => !a.shortlisted)
      : allApps;

  const shortlistedCount = allApps.filter((a) => a.shortlisted).length;
  const pendingCount = allApps.filter((a) => a.status === "APPLIED").length;
  const baseHref = `/${locale}/dashboard/salon/jobs/${id}`;

  const tabs = [
    { key: undefined,         label: lang === "fr" ? "Tout"             : "All",             count: allApps.length },
    { key: "shortlisted",     label: lang === "fr" ? "Sélectionnés"     : "Shortlisted",     count: shortlistedCount },
    { key: "not_shortlisted", label: lang === "fr" ? "Non sélectionnés" : "Not shortlisted", count: allApps.length - shortlistedCount },
  ];

  return (
    <div className="flex min-h-screen bg-muted/30">
      <SalonSidebar locale={locale} salonName={salon.name} />

      <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8 overflow-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
              <Link href={`/${locale}/dashboard/salon/jobs`}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                {lang === "fr" ? "Retour" : "Back"}
              </Link>
            </Button>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-[#1F2933]">{job.title}</h1>
              <span className={`text-xs border rounded-full px-2.5 py-0.5 font-medium ${POST_STATUS_BADGE_CLASS[job.status] ?? ""}`}>
                {getLabel(POST_STATUS_LABEL, job.status, lang)}
              </span>
              <Button size="sm" variant="outline" asChild className="ml-auto">
                <Link href={`/${locale}/dashboard/salon/jobs/${id}/edit`}>
                  <Pencil className="h-3.5 w-3.5 mr-1" />
                  {lang === "fr" ? "Modifier l'offre" : "Edit job"}
                </Link>
              </Button>
            </div>
          </div>

          <Card className="shadow-none border">
            <CardContent className="py-5 px-6 space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Briefcase className="h-4 w-4 shrink-0" />
                {getLabel(EMPLOYMENT_TYPE_LABEL, job.employmentType, lang)}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                {job.city}
              </div>
              {job.payInfo && (
                <Badge variant="outline" className="text-xs">{job.payInfo}</Badge>
              )}
              {job.description && (
                <p className="text-sm text-muted-foreground border-t pt-3 whitespace-pre-wrap">
                  {job.description}
                </p>
              )}
              {job.requirements && (
                <p className="text-sm text-muted-foreground border-t pt-3 whitespace-pre-wrap">
                  <span className="font-semibold text-foreground block mb-1">
                    {lang === "fr" ? "Exigences" : "Requirements"}
                  </span>
                  {job.requirements}
                </p>
              )}
            </CardContent>
          </Card>

          {job.status === "DRAFT" && (
            <Card className="shadow-none border border-primary/30 bg-primary/5">
              <CardContent className="py-4 px-5 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-sm">
                    {lang === "fr"
                      ? "Cette offre est en brouillon"
                      : "This job is a draft"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {lang === "fr"
                      ? "Publiez-la pour la rendre visible aux toiletteurs pendant 30 jours."
                      : "Publish it to make it visible to groomers for 30 days."}
                  </p>
                </div>
                <PublishJobButton jobId={job.id} locale={locale} />
              </CardContent>
            </Card>
          )}

          {job.status === "PUBLISHED" && job.expiresAt && (
            <Card className="shadow-none border">
              <CardContent className="py-3 px-5 flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 shrink-0" />
                {(() => {
                  const daysLeft = Math.ceil(
                    (new Date(job.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
                  );
                  if (daysLeft <= 0) return lang === "fr" ? "Expire aujourd'hui" : "Expires today";
                  return lang === "fr"
                    ? `Expire dans ${daysLeft} jour${daysLeft > 1 ? "s" : ""}`
                    : `Expires in ${daysLeft} day${daysLeft > 1 ? "s" : ""}`;
                })()}
              </CardContent>
            </Card>
          )}

          {job.status === "EXPIRED" && (
            <Card className="shadow-none border border-orange-300 bg-orange-50">
              <CardContent className="py-4 px-5 text-sm">
                <p className="font-semibold text-orange-700">
                  {lang === "fr" ? "Cette offre est expirée" : "This job has expired"}
                </p>
                <p className="text-xs text-orange-600 mt-0.5">
                  {lang === "fr"
                    ? "Elle n'est plus visible par les toiletteurs. Créez une nouvelle offre pour la republier."
                    : "It is no longer visible to groomers. Create a new posting to re-publish."}
                </p>
              </CardContent>
            </Card>
          )}

          {job.status === "FILLED" && job.engagement && (
            <Card className="shadow-none border border-success-border bg-success">
              <CardContent className="py-4 px-5 flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-success-foreground shrink-0" />
                <div>
                  <p className="font-semibold text-success-foreground text-sm">
                    {lang === "fr" ? "Poste comblé" : "Position filled"}
                  </p>
                  <p className="text-sm text-success-foreground/80">
                    {lang === "fr" ? "Confirmé avec" : "Confirmed with"}{" "}
                    <strong>{hasFullAccess ? job.engagement.groomer.fullName : extractFirstName(job.engagement.groomer.fullName)}</strong>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {lang === "fr" ? "Candidatures" : "Applications"} ({allApps.length})
                {pendingCount > 0 && (
                  <span className="ml-2 text-sm font-normal text-primary">
                    {pendingCount} {lang === "fr" ? "en attente" : "pending"}
                  </span>
                )}
              </h2>
            </div>

            <div className="flex gap-2 mb-4 flex-wrap">
              {tabs.map((tab) => {
                const href = tab.key ? `${baseHref}?filter=${tab.key}` : baseHref;
                const isActive = filter === tab.key || (!filter && !tab.key);
                return (
                  <Link
                    key={tab.key ?? "all"}
                    href={href}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium border transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:bg-muted"
                    }`}
                  >
                    {tab.label}
                    <span className={`text-xs rounded-full px-1.5 py-0.5 ${isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted"}`}>
                      {tab.count}
                    </span>
                  </Link>
                );
              })}
            </div>

            {filteredApps.length === 0 ? (
              <Card className="border-dashed shadow-none">
                <CardContent className="py-10 text-center text-muted-foreground text-sm">
                  {lang === "fr" ? "Aucune candidature dans cette catégorie." : "No applications in this category."}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredApps.map((app) => {
                  let specs: string[] = [];
                  try {
                    const parsed = JSON.parse(app.groomer.specializations || "[]");
                    specs = Array.isArray(parsed) ? parsed : [];
                  } catch { specs = []; }
                  const isOpen = job.status === "PUBLISHED" && app.status === "APPLIED";
                  const appDisplayName = hasFullAccess
                    ? app.groomer.fullName
                    : extractFirstName(app.groomer.fullName);

                  return (
                    <Card key={app.id} className={`border shadow-none ${app.status === "ACCEPTED" ? "border-success-border bg-success" : app.status === "REJECTED" ? "opacity-60" : ""}`}>
                      <CardContent className="py-4 px-5 space-y-3">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-10 w-10 shrink-0">
                            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                              {appDisplayName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium">{appDisplayName}</p>
                              <Badge variant={APP_STATUS_VARIANT[app.status] ?? "outline"} className="text-xs">
                                {getLabel(APP_STATUS_LABEL, app.status, lang)}
                              </Badge>
                              {app.shortlisted && (
                                <Badge variant="secondary" className="text-xs">
                                  {lang === "fr" ? "Sélectionné" : "Shortlisted"}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {app.groomer.city} · {app.groomer.yearsExperience}{" "}
                              {lang === "fr" ? "an(s) d'expérience" : "yr(s) experience"}
                            </p>
                            {specs.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {specs.map((s) => (
                                  <span key={s} className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium bg-[#F6EFE6] text-[#055864]">
                                    {getLabel(SPEC_LABEL, s, lang)}
                                  </span>
                                ))}
                              </div>
                            )}
                            {app.groomer.bio ? (
                              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                                {app.groomer.bio}
                              </p>
                            ) : (
                              <p className="text-xs text-muted-foreground/60 mt-1.5 italic">
                                {lang === "fr" ? "Aucune bio fournie" : "No bio provided"}
                              </p>
                            )}
                            {hasFullAccess && app.groomer.cvFileUrl && (
                              <a href={app.groomer.cvFileUrl} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-primary underline mt-1">
                                <FileText className="h-3.5 w-3.5" />
                                {lang === "fr" ? "Voir le CV" : "View CV"}
                              </a>
                            )}
                          </div>

                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <ShortlistButton applicationId={app.id} shortlisted={app.shortlisted} />
                            {isOpen && (
                              <JobDecisionButtons jobId={job.id} applicationId={app.id} groomerName={appDisplayName} />
                            )}
                          </div>
                        </div>

                        {app.message && (
                          <div className="flex gap-2 rounded-md bg-muted/50 px-3 py-2.5 text-sm">
                            <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                            <p className="text-muted-foreground whitespace-pre-wrap">{app.message}</p>
                          </div>
                        )}

                        {app.availabilityDates && (
                          <div className="flex gap-2 text-sm text-muted-foreground">
                            <CalendarDays className="h-4 w-4 shrink-0 mt-0.5" />
                            <span>{app.availabilityDates}</span>
                          </div>
                        )}

                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                          <span>
                            {lang === "fr" ? "Reçu le" : "Received on"}{" "}
                            {new Date(app.createdAt).toLocaleDateString(
                              locale === "fr" ? "fr-CA" : "en-CA",
                              { year: "numeric", month: "long", day: "numeric" }
                            )}
                          </span>
                        </div>
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
