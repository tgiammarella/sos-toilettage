export const dynamic = "force-dynamic";

import { requireRole } from "@/lib/auth-guards";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { GroomerSidebar } from "@/components/dashboard/GroomerSidebar";

export default async function GroomerApplicationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await requireRole(locale, "GROOMER");

  const t = await getTranslations("dashboard.groomer");
  const tDashboard = await getTranslations("dashboard");

  const groomer = await prisma.groomerProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      applications: {
        orderBy: { createdAt: "desc" },
        take: 30,
        include: {
          shiftPost: {
            select: {
              city: true,
              date: true,
              startTime: true,
              salon: { select: { name: true } },
            },
          },
          jobPost: {
            select: {
              title: true,
              city: true,
              salon: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  if (!groomer) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-muted/40">
      <GroomerSidebar locale={locale} groomerName={groomer.fullName} />

      {/* Main */}
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                {tDashboard("welcome")}, {groomer.fullName} 👋
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                {t("my_applications")}
              </p>
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link href={`/${locale}/shifts`}>Voir les remplacements</Link>
            </Button>
          </div>

          <Separator />

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
                  ? `${app.shiftPost?.salon?.name ?? "Salon"} — ${
                      app.shiftPost?.city
                    }`
                  : `${app.jobPost?.title} — ${app.jobPost?.city}`;
                const sub = isShift
                  ? app.shiftPost?.date
                    ? new Date(app.shiftPost.date).toLocaleDateString(
                        locale === "fr" ? "fr-CA" : "en-CA"
                      )
                    : ""
                  : app.jobPost?.salon?.name ?? "";

                return (
                  <Card key={app.id} className="border shadow-none">
                    <CardContent className="py-4 px-5 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{title}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {sub}
                        </p>
                      </div>
                      <AppStatusBadge status={app.status} locale={locale} />
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

function AppStatusBadge({
  status,
  locale,
}: {
  status: string;
  locale: string;
}) {
  const map: Record<
    string,
    {
      label: Record<string, string>;
      variant: "default" | "secondary" | "destructive" | "outline";
    }
  > = {
    APPLIED: {
      label: { fr: "En attente", en: "Pending" },
      variant: "outline",
    },
    ACCEPTED: {
      label: { fr: "Accepté", en: "Accepted" },
      variant: "default",
    },
    REJECTED: {
      label: { fr: "Non retenu", en: "Not selected" },
      variant: "secondary",
    },
    WITHDRAWN: {
      label: { fr: "Retiré", en: "Withdrawn" },
      variant: "outline",
    },
  };
  const item = map[status] ?? map.APPLIED;
  return (
    <Badge variant={item.variant}>{item.label[locale] ?? status}</Badge>
  );
}


