export const dynamic = "force-dynamic";

import { getTranslations } from "next-intl/server";
import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChevronRight, AlertTriangle } from "lucide-react";
import { SalonSidebar } from "@/components/dashboard/SalonSidebar";

export default async function SalonShiftsIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await requireRole(locale, "SALON");

  const tDashboard = await getTranslations("dashboard.salon");

  const salon = await prisma.salonProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      name: true,
      shiftPosts: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          city: true,
          date: true,
          startTime: true,
          numberOfAppointments: true,
          status: true,
          isUrgent: true,
          payType: true,
          payRateCents: true,
          _count: { select: { applications: { where: { status: "APPLIED" } } } },
        },
      },
    },
  });

  if (!salon) return null;

  const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
    PUBLISHED: "default",
    FILLED:    "secondary",
    DRAFT:     "outline",
    ARCHIVED:  "outline",
  };

  const statusLabel: Record<string, Record<string, string>> = {
    PUBLISHED: { fr: "Publié",    en: "Published" },
    FILLED:    { fr: "Comblé",    en: "Filled" },
    DRAFT:     { fr: "Brouillon", en: "Draft" },
    ARCHIVED:  { fr: "Archivé",   en: "Archived" },
  };

  return (
    <div className="flex min-h-screen bg-muted/30">
      <SalonSidebar locale={locale} salonName={salon.name} />

      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#1F2933]">{tDashboard("my_shifts")}</h1>
              <p className="text-sm text-muted-foreground">
                {salon.shiftPosts.length}{" "}
                {locale === "fr"
                  ? `remplacement${salon.shiftPosts.length !== 1 ? "s" : ""}`
                  : `shift${salon.shiftPosts.length !== 1 ? "s" : ""}`}
              </p>
            </div>
            <Button size="sm" asChild>
              <Link href={`/${locale}/dashboard/salon/shifts/new`}>
                {tDashboard("new_shift")}
              </Link>
            </Button>
          </div>

          <Separator />

          {salon.shiftPosts.length === 0 ? (
            <Card className="border-dashed shadow-none">
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                {tDashboard("no_shifts")}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {salon.shiftPosts.map((shift) => {
                const pending = shift._count.applications;
                const dateStr = new Date(shift.date).toLocaleDateString(
                  locale === "fr" ? "fr-CA" : "en-CA",
                  { weekday: "short", year: "numeric", month: "short", day: "numeric" }
                );
                const payLabel =
                  shift.payType === "HOURLY"
                    ? `${(shift.payRateCents / 100).toFixed(2)} $ / h`
                    : `${(shift.payRateCents / 100).toFixed(2)} $ (${locale === "fr" ? "forfait" : "flat rate"})`;

                return (
                  <Link
                    key={shift.id}
                    href={`/${locale}/dashboard/salon/shifts/${shift.id}`}
                    className="block"
                  >
                    <Card className={`border shadow-none hover:shadow-sm transition-shadow cursor-pointer ${shift.isUrgent ? "border-destructive/40" : ""}`}>
                      <CardContent className="py-4 px-5 flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className="font-medium truncate">
                              {shift.city} — {dateStr}
                            </p>
                            {shift.isUrgent && (
                              <Badge variant="destructive" className="text-xs flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" /> URGENT
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {shift.startTime} · {shift.numberOfAppointments} rdv · {payLabel}
                            {pending > 0 && (
                              <span className="ml-2 text-primary font-medium">
                                {pending}{" "}
                                {locale === "fr"
                                  ? `candidature${pending !== 1 ? "s" : ""}`
                                  : `applicant${pending !== 1 ? "s" : ""}`}
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant={statusVariant[shift.status] ?? "outline"}>
                            {statusLabel[shift.status]?.[locale] ?? shift.status}
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
