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
import { ArrowLeft, MapPin, Clock, Users, Wrench, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SalonSidebar } from "@/components/dashboard/SalonSidebar";

export default async function SalonShiftDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const session = await requireRole(locale, "SALON");

  const salon = await prisma.salonProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, name: true },
  });

  if (!salon) notFound();

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
              region: true,
              yearsExperience: true,
              specializations: true,
            },
          },
        },
      },
      engagement: {
        include: { groomer: { select: { fullName: true } } },
      },
    },
  });

  if (!shift || shift.salonId !== salon.id) notFound();

  const statusColor: Record<string, string> = {
    PUBLISHED: "bg-green-100 text-green-700 border-green-300",
    FILLED:    "bg-blue-100 text-blue-700 border-blue-300",
    DRAFT:     "bg-gray-100 text-gray-600 border-gray-300",
    ARCHIVED:  "bg-gray-100 text-gray-500 border-gray-200",
  };

  const statusLabel: Record<string, string> = {
    PUBLISHED: locale === "fr" ? "Publié"    : "Published",
    FILLED:    locale === "fr" ? "Comblé"    : "Filled",
    DRAFT:     locale === "fr" ? "Brouillon" : "Draft",
    ARCHIVED:  locale === "fr" ? "Archivé"   : "Archived",
  };

  const statusLabels = {
    APPLIED:   { fr: "En attente",  en: "Pending" },
    ACCEPTED:  { fr: "Accepté",     en: "Accepted" },
    REJECTED:  { fr: "Non retenu",  en: "Rejected" },
    WITHDRAWN: { fr: "Retiré",      en: "Withdrawn" },
  } as const;

  const payLabel =
    shift.payType === "HOURLY"
      ? `${(shift.payRateCents / 100).toFixed(2)} $ / h`
      : `${(shift.payRateCents / 100).toFixed(2)} $ (forfait)`;

  const tags: string[] = JSON.parse(shift.criteriaTags || "[]");

  return (
    <div className="flex min-h-screen bg-muted/30">
      <SalonSidebar locale={locale} salonName={salon.name} />

      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
              <Link href={`/${locale}/dashboard/salon/shifts`}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Retour
              </Link>
            </Button>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold">Remplacement — {shift.city}</h1>
              <span className={`text-xs border rounded-full px-2.5 py-0.5 font-medium ${statusColor[shift.status]}`}>
                {statusLabel[shift.status]}
              </span>
              {shift.isUrgent && (
                <Badge variant="destructive" className="text-xs flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> URGENT
                </Badge>
              )}
            </div>
          </div>

          <Card className="shadow-none border">
            <CardContent className="py-5 px-6 space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 shrink-0" />
                {new Date(shift.date).toLocaleDateString(
                  locale === "fr" ? "fr-CA" : "en-CA",
                  { weekday: "long", year: "numeric", month: "long", day: "numeric" }
                )} à {shift.startTime}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                {shift.address}, {shift.city} ({shift.region}) — {shift.postalCode}
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge variant="outline" className="text-xs">{payLabel}</Badge>
                <Badge variant="outline" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  {shift.numberOfAppointments} rendez-vous
                </Badge>
                {shift.equipmentProvided && (
                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                    <Wrench className="h-3 w-3" /> Équipement fourni
                  </Badge>
                )}
                {tags.map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                ))}
              </div>
              {shift.notes && (
                <p className="text-sm text-muted-foreground border-t pt-3">{shift.notes}</p>
              )}
            </CardContent>
          </Card>

          {shift.status === "FILLED" && shift.engagement && (
            <Card className="shadow-none border border-green-200 bg-green-50">
              <CardContent className="py-4 px-5 flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                <div>
                  <p className="font-semibold text-green-800 text-sm">Remplacement comblé</p>
                  <p className="text-sm text-green-700">
                    Confirmé avec <strong>{shift.engagement.groomer.fullName}</strong>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          <section>
            <h2 className="text-lg font-semibold mb-4">
              Candidatures ({shift.applications.length})
            </h2>

            {shift.applications.length === 0 ? (
              <Card className="border-dashed shadow-none">
                <CardContent className="py-10 text-center text-muted-foreground text-sm">
                  Aucune candidature reçue pour l&apos;instant.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {shift.applications.map((app) => {
                  const specs: string[] = JSON.parse(app.groomer.specializations || "[]");
                  const isAccepted = app.status === "ACCEPTED";
                  const isRejected = app.status === "REJECTED";
                  const isOpen = shift.status === "PUBLISHED" && app.status === "APPLIED";

                  const statusBadge: Record<string, { label: string; className: string }> = {
                    APPLIED:   { label: statusLabels.APPLIED[locale === "fr" ? "fr" : "en"],   className: "border text-muted-foreground" },
                    ACCEPTED:  { label: statusLabels.ACCEPTED[locale === "fr" ? "fr" : "en"],  className: "bg-green-600 text-white" },
                    REJECTED:  { label: statusLabels.REJECTED[locale === "fr" ? "fr" : "en"],  className: "bg-muted text-muted-foreground" },
                    WITHDRAWN: { label: statusLabels.WITHDRAWN[locale === "fr" ? "fr" : "en"], className: "border text-muted-foreground" },
                  };
                  const badge = statusBadge[app.status];

                  return (
                    <Card
                      key={app.id}
                      className={`border shadow-none ${
                        isAccepted ? "border-green-200 bg-green-50" : isRejected ? "opacity-60" : ""
                      }`}
                    >
                      <CardContent className="py-4 px-5 flex items-center gap-4">
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                            {app.groomer.fullName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium">{app.groomer.fullName}</p>
                            {badge && (
                              <Badge className={`text-xs ${badge.className}`}>{badge.label}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {app.groomer.city} · {app.groomer.yearsExperience} an(s) d&apos;expérience
                          </p>
                          {specs.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {specs.map((s) => (
                                <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        {isOpen && (
                          <AcceptApplicantButton shiftId={shift.id} applicationId={app.id} />
                        )}
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
