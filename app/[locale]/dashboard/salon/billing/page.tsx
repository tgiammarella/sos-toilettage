export const dynamic = "force-dynamic";

import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CreditCard } from "lucide-react";
import { SalonSidebar } from "@/components/dashboard/SalonSidebar";

export default async function SalonBillingPage({
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
      creditsAvailable: true,
      subscriptionPlan: true,
      subscriptionStatus: true,
    },
  });

  if (!salon) notFound();

  const hasActiveSub = salon.subscriptionStatus === "ACTIVE";

  return (
    <div className="flex min-h-screen bg-muted/30">
      <SalonSidebar locale={locale} salonName={salon.name} />

      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{tDashboard("billing")}</h1>
              <p className="text-sm text-muted-foreground">
                Résumé de vos crédits et de votre abonnement.
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Crédits disponibles</CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-3xl font-bold">{salon.creditsAvailable}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Chaque remplacement publié consomme 1 crédit.
                </p>
              </CardContent>
            </Card>

            <Card className="border shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  {tDashboard("subscription")}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4 space-y-2">
                <Badge variant={hasActiveSub ? "default" : "outline"} className="text-xs">
                  {hasActiveSub ? salon.subscriptionPlan || "PRO" : "Aucun abonnement actif"}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  La gestion détaillée de la facturation Stripe sera ajoutée ici.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-dashed shadow-none">
            <CardContent className="py-8 text-sm text-muted-foreground">
              L&apos;historique détaillé des factures et des achats de crédits
              sera disponible ici dans une prochaine version.
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
