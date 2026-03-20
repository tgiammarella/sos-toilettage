export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/nav/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Wrench, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { QuickApplyButton } from "@/components/shifts/QuickApplyButton";
import { CRITERIA_LABEL, getLang, getLabel } from "@/lib/labels";

const PAGE_SIZE = 20;

export default async function ShiftsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale } = await params;
  const { page: pageParam } = await searchParams;
  const session = await auth();
  const t = await getTranslations("shifts");

  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const skip = (currentPage - 1) * PAGE_SIZE;

  const where = { status: { in: ["PUBLISHED", "FILLED"] as ("PUBLISHED" | "FILLED")[] } };

  const [totalCount, shifts] = await Promise.all([
    prisma.shiftPost.count({ where }),
    prisma.shiftPost.findMany({
      where,
      orderBy: [{ isUrgent: "desc" }, { date: "asc" }],
      skip,
      take: PAGE_SIZE,
      select: {
        id: true, city: true, region: true, date: true, startTime: true,
        isUrgent: true, status: true, payType: true, payRateCents: true,
        numberOfAppointments: true, requiredExperienceYears: true,
        criteriaTags: true, equipmentProvided: true, notes: true,
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const publishedCount = totalCount;

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

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-10 max-w-5xl">
          <h1 className="text-3xl font-bold mb-2 text-[#1F2933]">{t("title")}</h1>
          <p className="text-[#4a6260] mb-8 text-sm">
            {publishedCount === 1 ? t("count", { count: publishedCount }) : t("count_plural", { count: publishedCount })}
          </p>

          {shifts.length === 0 ? (
            <Card className="border-dashed bg-card/80">
              <CardContent className="py-16 text-center text-muted-foreground">
                {t("no_shifts")}
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
                    className={`border shadow-sm transition-shadow bg-white ${isFilled ? "opacity-70 border-border/80" : shift.isUrgent ? "border-l-[3px] border-l-[#dc2626] border-border/80 hover:shadow-md" : "border-border/80 hover:shadow-md"}`}
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
                              {t("salon_in_city", { city: shift.city })}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            {shift.city}
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
                              <span key={tag} className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium bg-[#F6EFE6] text-[#055864]">
                                {getLabel(CRITERIA_LABEL, tag, getLang(locale))}
                              </span>
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
                          ) : session?.user.role === "GROOMER" ? (
                            <QuickApplyButton
                              shiftId={shift.id}
                              alreadyApplied={alreadyApplied}
                              locale={locale}
                            />
                          ) : (
                            <Button asChild size="sm">
                              <Link href={`/${locale}/shifts/${shift.id}`}>
                                {t("apply")}
                              </Link>
                            </Button>
                          )}
                          {!isFilled && (
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/${locale}/shifts/${shift.id}`}>
                                {t("view_details")}
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-6">
                  {currentPage > 1 ? (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/${locale}/shifts?page=${currentPage - 1}`}>
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        {t("previous")}
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" disabled>
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      {t("previous")}
                    </Button>
                  )}

                  <span className="text-sm text-muted-foreground">
                    {t("page_of", { page: currentPage, total: totalPages })}
                  </span>

                  {currentPage < totalPages ? (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/${locale}/shifts?page=${currentPage + 1}`}>
                        {t("next")}
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" disabled>
                      {t("next")}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
