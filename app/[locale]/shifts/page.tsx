export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/nav/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Wrench, AlertTriangle, CheckCircle } from "lucide-react";
import Link from "next/link";

export default async function ShiftsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  const t = await getTranslations("shifts");

  // Show PUBLISHED and FILLED (FILLED shows with hidden salon name)
  const shifts = await prisma.shiftPost.findMany({
    where: { status: { in: ["PUBLISHED", "FILLED"] } },
    orderBy: [{ isUrgent: "desc" }, { date: "asc" }],
    include: {
      salon: { select: { name: true } },
    },
  });

  // Collect shift IDs the logged-in groomer has already applied to
  const appliedShiftIds = new Set<string>();
  if (session?.user.role === "GROOMER") {
    const groomer = await prisma.groomerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (groomer) {
      const apps = await prisma.application.findMany({
        where: { groomerId: groomer.id, shiftPostId: { not: null } },
        select: { shiftPostId: true },
      });
      apps.forEach((a) => { if (a.shiftPostId) appliedShiftIds.add(a.shiftPostId); });
    }
  }

  const publishedCount = shifts.filter((s) => s.status === "PUBLISHED").length;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-10 max-w-5xl">
          <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
          <p className="text-muted-foreground mb-8 text-sm">
            {publishedCount} remplacement{publishedCount !== 1 ? "s" : ""} disponible{publishedCount !== 1 ? "s" : ""}
          </p>

          {shifts.length === 0 ? (
            <Card className="border-dashed bg-card/80">
              <CardContent className="py-16 text-center text-muted-foreground">
                Aucun remplacement disponible pour l&apos;instant.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {shifts.map((shift) => {
                const isFilled = shift.status === "FILLED";
                const alreadyApplied = appliedShiftIds.has(shift.id);
                const payLabel =
                  shift.payType === "HOURLY"
                    ? `${(shift.payRateCents / 100).toFixed(2)} $ ${t("per_hour")}`
                    : `${(shift.payRateCents / 100).toFixed(2)} $ (${t("flat_rate")})`;

                return (
                  <Card
                    key={shift.id}
                    className={`border border-border/80 shadow-sm transition-shadow bg-card/95 ${isFilled ? "opacity-70" : "hover:shadow-md"}`}
                  >
                    <CardContent className="py-5 px-6">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            {shift.isUrgent && !isFilled && (
                              <Badge variant="destructive" className="text-xs font-bold flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                {t("urgent")}
                              </Badge>
                            )}
                            {isFilled && (
                              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                {t("filled")}
                              </Badge>
                            )}
                            <span className="font-semibold text-base">
                              {isFilled ? "Salon confidentiel" : shift.salon.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            {shift.city}, {shift.region}
                          </div>

                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                            <Clock className="h-3.5 w-3.5 shrink-0" />
                            {new Date(shift.date).toLocaleDateString(
                              locale === "fr" ? "fr-CA" : "en-CA",
                              { weekday: "long", year: "numeric", month: "long", day: "numeric" }
                            )}{" "}
                            à {shift.startTime}
                          </div>

                          <div className="flex flex-wrap gap-2 mt-3">
                            <Badge variant="outline" className="text-xs">{payLabel}</Badge>
                            <Badge variant="outline" className="text-xs">
                              {shift.numberOfAppointments} {t("appointments")}
                            </Badge>
                            {shift.equipmentProvided && (
                              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                                <Wrench className="h-3 w-3" />
                                {t("equipment_provided")}
                              </Badge>
                            )}
                            {(JSON.parse(shift.criteriaTags || "[]") as string[]).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                            ))}
                          </div>

                          {shift.notes && (
                            <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{shift.notes}</p>
                          )}
                        </div>

                        <div className="shrink-0 flex flex-col items-end gap-2">
                          {isFilled ? (
                            <Button disabled variant="secondary" size="sm">
                              {t("filled")}
                            </Button>
                          ) : alreadyApplied ? (
                            <Button disabled variant="outline" size="sm" className="border-primary text-primary">
                              {t("applied")}
                            </Button>
                          ) : (
                            <Button asChild size="sm">
                              <Link href={`/${locale}/shifts/${shift.id}`}>
                                {t("apply")}
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
