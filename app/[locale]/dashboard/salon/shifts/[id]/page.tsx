export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AcceptApplicantButton } from "@/components/shifts/AcceptApplicantButton";
import { SuggestedGroomers } from "@/components/shifts/SuggestedGroomers";
import { DeleteShiftButton } from "@/components/shifts/DeleteShiftButton";
import { CompleteShiftButton } from "@/components/shifts/CompleteShiftButton";
import {
  ArrowLeft, MapPin, Clock, Users, Wrench, AlertTriangle, CheckCircle, FileText, Pencil, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SalonSidebar } from "@/components/dashboard/SalonSidebar";
import {
  getLang,
  POST_STATUS_LABEL,
  POST_STATUS_BADGE_CLASS,
  APP_STATUS_LABEL,
  APP_STATUS_VARIANT,
  SPEC_LABEL,
  CRITERIA_LABEL,
  getLabel,
} from "@/lib/labels";
import {
  canViewFullGroomerProfile,
  extractFirstName,
  getSalonAccessProfile,
} from "@/lib/groomer-access";

export default async function SalonShiftDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
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

  const shift = await prisma.shiftPost.findUnique({
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
        include: {
          groomer: { select: { fullName: true } },
          reviews: { where: { reviewerUserId: session.user.id }, select: { id: true } },
        },
      },
    },
  });

  if (!shift || shift.salonId !== salon.id) notFound();

  const payLabel =
    shift.payType === "HOURLY"
      ? `${(shift.payRateCents / 100).toFixed(2)} $ / h`
      : `${(shift.payRateCents / 100).toFixed(2)} $ (${lang === "fr" ? "forfait" : "flat rate"})`;

  const tags: string[] = (() => {
    try { return JSON.parse(shift.criteriaTags || "[]"); } catch { return []; }
  })();

  return (
    <div className="flex min-h-screen bg-muted/30">
      <SalonSidebar locale={locale} salonName={salon.name} />

      <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8 overflow-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
              <Link href={`/${locale}/dashboard/salon/shifts`}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                {lang === "fr" ? "Retour" : "Back"}
              </Link>
            </Button>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-[#1F2933]">
                {lang === "fr" ? "Remplacement" : "Shift"} — {shift.city}
              </h1>
              <span className={`text-xs border rounded-full px-2.5 py-0.5 font-medium ${POST_STATUS_BADGE_CLASS[shift.status] ?? ""}`}>
                {getLabel(POST_STATUS_LABEL, shift.status, lang)}
              </span>
              {shift.isUrgent && (
                <>
                  <Badge variant="destructive" className="text-xs font-bold flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> URGENT
                  </Badge>
                  <span className="text-xs text-destructive/80">
                    {lang === "fr" ? "Priorité élevée" : "High priority"}
                  </span>
                </>
              )}
            </div>

            {/* Actions: Edit / Delete — only for non-filled, non-archived shifts */}
            {(shift.status === "PUBLISHED" || shift.status === "DRAFT") && (
              <div className="flex items-center gap-3 mt-3">
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/${locale}/dashboard/salon/shifts/${shift.id}/edit`}>
                    <Pencil className="h-3.5 w-3.5 mr-1" />
                    {lang === "fr" ? "Modifier" : "Edit"}
                  </Link>
                </Button>
                <DeleteShiftButton shiftId={shift.id} locale={locale} />
              </div>
            )}
          </div>

          <Card className="shadow-none border">
            <CardContent className="py-5 px-6 space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 shrink-0" />
                {new Date(shift.date).toLocaleDateString(
                  locale === "fr" ? "fr-CA" : "en-CA",
                  { weekday: "long", year: "numeric", month: "long", day: "numeric" }
                )}{" "}
                {lang === "fr" ? "à" : "at"} {shift.startTime}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                {shift.address}, {shift.city} — {shift.postalCode}
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge variant="outline" className="text-xs">{payLabel}</Badge>
                <Badge variant="outline" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  {shift.numberOfAppointments}{" "}
                  {lang === "fr" ? "rendez-vous" : "appointments"}
                </Badge>
                {shift.equipmentProvided && (
                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                    <Wrench className="h-3 w-3" />
                    {lang === "fr" ? "Équipement fourni" : "Equipment provided"}
                  </Badge>
                )}
                {tags.map((t) => (
                  <span key={t} className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium bg-[#F6EFE6] text-[#055864]">
                    {getLabel(CRITERIA_LABEL, t, lang)}
                  </span>
                ))}
              </div>
              {shift.notes && (
                <p className="text-sm text-muted-foreground border-t pt-3">{shift.notes}</p>
              )}
            </CardContent>
          </Card>

          {(shift.status === "FILLED" || shift.status === "COMPLETED") && shift.engagement && (() => {
            const [h, m] = shift.startTime.split(":").map(Number);
            const shiftStart = new Date(shift.date);
            shiftStart.setHours(h, m, 0, 0);
            const canComplete = shift.status === "FILLED" && new Date() >= shiftStart;

            return (
              <Card className="shadow-none border border-success-border bg-success">
                <CardContent className="py-4 px-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-success-foreground shrink-0" />
                    <div>
                      <p className="font-semibold text-success-foreground text-sm">
                        {shift.status === "COMPLETED"
                          ? (lang === "fr" ? "Remplacement complété" : "Shift completed")
                          : (lang === "fr" ? "Remplacement comblé" : "Shift filled")}
                      </p>
                      <p className="text-sm text-success-foreground/80">
                        {lang === "fr" ? "Confirmé avec" : "Confirmed with"}{" "}
                        <strong>{hasFullAccess ? shift.engagement.groomer.fullName : extractFirstName(shift.engagement.groomer.fullName)}</strong>
                      </p>
                    </div>
                  </div>
                  {canComplete && (
                    <CompleteShiftButton shiftId={shift.id} locale={locale} />
                  )}
                  {shift.status === "COMPLETED" && shift.engagement.reviews.length === 0 && (
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/${locale}/dashboard/salon/shifts/${shift.id}/review`}>
                        <Star className="h-4 w-4 mr-1.5" />
                        {lang === "fr" ? "Laisser un avis" : "Leave a review"}
                      </Link>
                    </Button>
                  )}
                  {shift.status === "COMPLETED" && shift.engagement.reviews.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      <Star className="h-3 w-3 mr-1 fill-amber-400 text-amber-400" />
                      {lang === "fr" ? "Avis envoyé" : "Review submitted"}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })()}

          {(shift.status === "PUBLISHED" || shift.status === "DRAFT") && (
            <SuggestedGroomers shiftId={shift.id} locale={locale} />
          )}

          <Separator />

          <section>
            <h2 className="text-lg font-semibold mb-4">
              {lang === "fr" ? "Candidatures" : "Applications"} ({shift.applications.length})
            </h2>

            {shift.applications.length === 0 ? (
              <Card className="border-dashed shadow-none">
                <CardContent className="py-10 text-center text-muted-foreground text-sm">
                  {lang === "fr"
                    ? "Aucune candidature reçue pour l'instant."
                    : "No applications received yet."}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {shift.applications.map((app) => {
                  const specs: string[] = (() => {
                    try { return JSON.parse(app.groomer.specializations || "[]"); } catch { return []; }
                  })();
                  const isAccepted = app.status === "ACCEPTED";
                  const isRejected = app.status === "REJECTED";
                  const isOpen = shift.status === "PUBLISHED" && app.status === "APPLIED";
                  const appDisplayName = hasFullAccess
                    ? app.groomer.fullName
                    : extractFirstName(app.groomer.fullName);

                  return (
                    <Card key={app.id} className={`border shadow-none ${isAccepted ? "border-success-border bg-success" : isRejected ? "opacity-60" : ""}`}>
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
                              <Badge
                                variant={APP_STATUS_VARIANT[app.status] ?? "outline"}
                                className="text-xs"
                              >
                                {getLabel(APP_STATUS_LABEL, app.status, lang)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {app.groomer.city} · {app.groomer.yearsExperience}{" "}
                              {lang === "fr" ? "an(s) d'expérience" : "yr(s) experience"}
                            </p>
                            {specs.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
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
                              <a
                                href={app.groomer.cvFileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-primary underline mt-1"
                              >
                                <FileText className="h-3.5 w-3.5" />
                                {lang === "fr" ? "Voir le CV" : "View CV"}
                              </a>
                            )}
                          </div>

                          {isOpen && (
                            <AcceptApplicantButton shiftId={shift.id} applicationId={app.id} />
                          )}
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
