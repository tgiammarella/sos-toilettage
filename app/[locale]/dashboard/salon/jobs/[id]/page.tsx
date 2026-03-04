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
} from "lucide-react";
import { SalonSidebar } from "@/components/dashboard/SalonSidebar";

const EMPLOYMENT_LABELS: Record<string, string> = {
  FULL_TIME: "Temps plein",
  PART_TIME: "Temps partiel",
  CONTRACT:  "Contrat",
};

const APP_STATUS_MAP: Record<
  string,
  { label: { fr: string; en: string }; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  APPLIED:   { label: { fr: "En attente",  en: "Pending"   }, variant: "outline" },
  ACCEPTED:  { label: { fr: "Accepté",     en: "Accepted"  }, variant: "default" },
  REJECTED:  { label: { fr: "Non retenu",  en: "Rejected"  }, variant: "secondary" },
  WITHDRAWN: { label: { fr: "Retiré",      en: "Withdrawn" }, variant: "outline" },
};

const JOB_STATUS_LABEL: Record<string, { fr: string; en: string }> = {
  PUBLISHED: { fr: "Publié",    en: "Published" },
  FILLED:    { fr: "Comblé",    en: "Filled"    },
  DRAFT:     { fr: "Brouillon", en: "Draft"     },
  ARCHIVED:  { fr: "Archivé",   en: "Archived"  },
};

const JOB_STATUS_COLOR: Record<string, string> = {
  PUBLISHED: "bg-green-100 text-green-700 border-green-300",
  FILLED:    "bg-blue-100 text-blue-700 border-blue-300",
  DRAFT:     "bg-gray-100 text-gray-600 border-gray-300",
  ARCHIVED:  "bg-gray-100 text-gray-500 border-gray-200",
};

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

  const salon = await prisma.salonProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, name: true },
  });

  if (!salon) notFound();

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
              region: true,
              yearsExperience: true,
              specializations: true,
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

  const lang = locale === "en" ? "en" : "fr";

  // Filter tabs
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
    { key: undefined,         label: lang === "fr" ? "Tout"           : "All",           count: allApps.length },
    { key: "shortlisted",     label: lang === "fr" ? "Sélectionnés"   : "Shortlisted",   count: shortlistedCount },
    { key: "not_shortlisted", label: lang === "fr" ? "Non sélectionnés" : "Not shortlisted", count: allApps.length - shortlistedCount },
  ];

  return (
    <div className="flex min-h-screen bg-muted/30">
      <SalonSidebar locale={locale} salonName={salon.name} />

      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
              <Link href={`/${locale}/dashboard/salon/jobs`}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                {lang === "fr" ? "Retour" : "Back"}
              </Link>
            </Button>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold">{job.title}</h1>
              <span className={`text-xs border rounded-full px-2.5 py-0.5 font-medium ${JOB_STATUS_COLOR[job.status]}`}>
                {JOB_STATUS_LABEL[job.status]?.[lang] ?? job.status}
              </span>
            </div>
          </div>

          <Card className="shadow-none border">
            <CardContent className="py-5 px-6 space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Briefcase className="h-4 w-4 shrink-0" />
                {EMPLOYMENT_LABELS[job.employmentType] ?? job.employmentType}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                {job.city}, {job.region}
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

          {job.status === "FILLED" && job.engagement && (
            <Card className="shadow-none border border-green-200 bg-green-50">
              <CardContent className="py-4 px-5 flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                <div>
                  <p className="font-semibold text-green-800 text-sm">
                    {lang === "fr" ? "Poste comblé" : "Position filled"}
                  </p>
                  <p className="text-sm text-green-700">
                    {lang === "fr" ? "Confirmé avec" : "Confirmed with"}{" "}
                    <strong>{job.engagement.groomer.fullName}</strong>
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

            {/* Filter tabs */}
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
                  } catch {
                    specs = [];
                  }
                  const statusInfo = APP_STATUS_MAP[app.status] ?? APP_STATUS_MAP.APPLIED;
                  const isOpen = job.status === "PUBLISHED" && app.status === "APPLIED";

                  return (
                    <Card
                      key={app.id}
                      className={`border shadow-none ${
                        app.status === "ACCEPTED"
                          ? "border-green-200 bg-green-50"
                          : app.status === "REJECTED"
                          ? "opacity-60"
                          : ""
                      }`}
                    >
                      <CardContent className="py-4 px-5 space-y-3">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-10 w-10 shrink-0">
                            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                              {app.groomer.fullName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium">{app.groomer.fullName}</p>
                              <Badge variant={statusInfo.variant} className="text-xs">
                                {statusInfo.label[lang]}
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
                                  <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                                ))}
                              </div>
                            )}
                            {app.groomer.cvFileUrl && (
                              <a
                                href={app.groomer.cvFileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary underline mt-1 inline-block"
                              >
                                {lang === "fr" ? "Voir le CV" : "View CV"}
                              </a>
                            )}
                          </div>

                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <ShortlistButton
                              applicationId={app.id}
                              shortlisted={app.shortlisted}
                            />
                            {isOpen && (
                              <JobDecisionButtons
                                jobId={job.id}
                                applicationId={app.id}
                                groomerName={app.groomer.fullName}
                              />
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
