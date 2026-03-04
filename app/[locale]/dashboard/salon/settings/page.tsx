export const dynamic = "force-dynamic";

import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";
import { SalonSidebar } from "@/components/dashboard/SalonSidebar";

export default async function SalonSettingsPage({
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
      phone: true,
      city: true,
      region: true,
      user: { select: { email: true } },
    },
  });

  if (!salon) notFound();

  return (
    <div className="flex min-h-screen bg-muted/30">
      <SalonSidebar locale={locale} salonName={salon.name} />

      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{tDashboard("settings")}</h1>
              <p className="text-sm text-muted-foreground">
                Informations de base de votre salon. La sauvegarde sera ajoutée
                dans une prochaine version.
              </p>
            </div>
          </div>

          <Separator />

          <Card className="border shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Profil du salon
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-5 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Nom du salon</Label>
                  <Input id="name" defaultValue={salon.name ?? ""} readOnly />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Courriel de contact</Label>
                  <Input id="email" type="email" defaultValue={salon.user?.email ?? ""} readOnly />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input id="phone" defaultValue={salon.phone ?? ""} readOnly />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="city">Ville</Label>
                  <Input id="city" defaultValue={salon.city ?? ""} readOnly />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="region">Région</Label>
                  <Input id="region" defaultValue={salon.region ?? ""} readOnly />
                </div>
              </div>
              <p className="text-xs text-muted-foreground pt-1">
                Ces informations proviennent de votre inscription. La
                modification directe dans l&apos;interface sera disponible plus
                tard.
              </p>
              <Button size="sm" disabled className="mt-2">
                Enregistrer (bientôt disponible)
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
