export const dynamic = "force-dynamic";

import { requireRole } from "@/lib/auth-guards";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle } from "lucide-react";
import { GroomerSidebar } from "@/components/dashboard/GroomerSidebar";

export default async function GroomerConfirmedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await requireRole(locale, "GROOMER");

  const t = await getTranslations("dashboard.groomer");
  const tDashboard = await getTranslations("dashboard");
  const tConfirmed = await getTranslations("confirmed");

  const groomer = await prisma.groomerProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      engagements: {
        orderBy: { startsAt: "desc" },
        take: 20,
        include: {
          salon: { select: { name: true, city: true } },
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
      <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1F2933]">
                {tDashboard("welcome")}, {groomer.fullName} 👋
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                {t("confirmed")}
              </p>
            </div>
          </div>

          <Separator />

          {groomer.engagements.length === 0 ? (
            <Card className="border-dashed shadow-none">
              <CardContent className="py-10 text-center text-muted-foreground text-sm">
                {tConfirmed("groomer_empty")}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {groomer.engagements.map((eng) => (
                <Card key={eng.id} className="border shadow-none">
                  <CardContent className="py-4 px-5 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {eng.salon.name}
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {eng.salon.city} ·{" "}
                        {new Date(eng.startsAt).toLocaleDateString(
                          locale === "fr" ? "fr-CA" : "en-CA",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="inline-flex items-center gap-1 text-xs"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      {tConfirmed("confirmed_badge")}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}


