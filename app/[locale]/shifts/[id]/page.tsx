export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/nav/Navbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ApplyButton } from "@/components/shifts/ApplyButton";
import { MapPin, Clock, Wrench, AlertTriangle, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CRITERIA_LABEL, getLang, getLabel } from "@/lib/labels";

export default async function PublicShiftDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const session = await auth();

  const shift = await prisma.shiftPost.findUnique({
    where: { id },
    select: {
      id: true, city: true, region: true, address: true, postalCode: true,
      date: true, startTime: true, isUrgent: true, status: true,
      payType: true, payRateCents: true, numberOfAppointments: true,
      requiredExperienceYears: true, criteriaTags: true,
      equipmentProvided: true, notes: true, salonId: true,
    },
  });

  // Only show PUBLISHED or FILLED shifts
  if (!shift || (shift.status !== "PUBLISHED" && shift.status !== "FILLED")) {
    notFound();
  }

  const isFilled = shift.status === "FILLED";
  const tags: string[] = JSON.parse(shift.criteriaTags || "[]");

  const payLabel =
    shift.payType === "HOURLY"
      ? `${(shift.payRateCents / 100).toFixed(2)} $ / h`
      : `${(shift.payRateCents / 100).toFixed(2)} $ (forfait)`;

  // Check if the logged-in groomer has already applied
  let alreadyApplied = false;
  let groomerId: string | null = null;

  if (session?.user.role === "GROOMER") {
    const groomer = await prisma.groomerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    groomerId = groomer?.id ?? null;

    if (groomerId) {
      const existing = await prisma.application.findFirst({
        where: { shiftPostId: id, groomerId },
        select: { id: true },
      });
      alreadyApplied = !!existing;
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-10 max-w-2xl">
          <Button variant="ghost" size="sm" asChild className="mb-5 -ml-2">
            <Link href={`/${locale}/shifts`}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Retour aux remplacements
            </Link>
          </Button>

          <div className="flex items-start gap-3 flex-wrap mb-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {shift.isUrgent && (
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="text-xs font-bold flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> URGENT
                    </Badge>
                    <span className="text-xs text-destructive/80">
                      {locale === "fr" ? "Priorité élevée" : "High priority"}
                    </span>
                  </div>
                )}
                {isFilled && (
                  <Badge variant="secondary" className="text-xs">Comblé</Badge>
                )}
              </div>
              <h1 className="text-2xl font-bold text-[#1F2933]">
                {locale === "fr"
                  ? `Salon partenaire à ${shift.city}`
                  : `Partner salon in ${shift.city}`}
              </h1>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {shift.city}
              </div>
            </div>
          </div>

          <Card className="border border-border/80 shadow-sm mb-6 bg-white">
            <CardContent className="py-5 px-6 space-y-4">
              {/* Date & time */}
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Date &amp; heure</p>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  {new Date(shift.date).toLocaleDateString(
                    locale === "fr" ? "fr-CA" : "en-CA",
                    { weekday: "long", year: "numeric", month: "long", day: "numeric" }
                  )} à {shift.startTime}
                </div>
              </div>

              {/* Pay */}
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Rémunération</p>
                <Badge variant="outline">{payLabel}</Badge>
              </div>

              {/* Workload */}
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Charge</p>
                <div className="flex items-center gap-1.5 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                  {shift.numberOfAppointments} rendez-vous
                </div>
              </div>

              {/* Experience */}
              {shift.requiredExperienceYears > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Expérience requise</p>
                  <p className="text-sm">{shift.requiredExperienceYears} an(s) minimum</p>
                </div>
              )}

              {/* Criteria tags */}
              {tags.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Spécialisations demandées</p>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium bg-[#F6EFE6] text-[#055864]">
                        {getLabel(CRITERIA_LABEL, tag, getLang(locale))}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Equipment */}
              {shift.equipmentProvided && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Wrench className="h-4 w-4 shrink-0" />
                  Équipement fourni par le salon
                </div>
              )}

              {/* Notes */}
              {shift.notes && (
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Notes du salon</p>
                  <p className="text-sm text-muted-foreground">{shift.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <ApplyButton
            shiftId={shift.id}
            locale={locale}
            userRole={session?.user.role ?? null}
            alreadyApplied={alreadyApplied}
            isFilled={isFilled}
          />
        </div>
      </main>
    </div>
  );
}
