export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Settings } from "lucide-react";
import { SalonSidebar } from "@/components/dashboard/SalonSidebar";
import { SalonSettingsForm } from "@/components/salon/SalonSettingsForm";
import { getLang } from "@/lib/labels";

export default async function SalonSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await requireRole(locale, "SALON");
  const lang = getLang(locale);

  const salon = await prisma.salonProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      name: true,
      phone: true,
      city: true,
      user: { select: { email: true } },
    },
  });

  if (!salon) notFound();

  return (
    <div className="flex min-h-screen bg-muted/30">
      <SalonSidebar locale={locale} salonName={salon.name} />

      <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8 overflow-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1F2933]">
              {lang === "fr" ? "Paramètres" : "Settings"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {lang === "fr"
                ? "Informations de base de votre salon."
                : "Basic information about your salon."}
            </p>
          </div>

          <Separator />

          <Card className="border shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Settings className="h-4 w-4" />
                {lang === "fr" ? "Profil du salon" : "Salon profile"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-5">
              <SalonSettingsForm
                lang={lang}
                initial={{
                  name:  salon.name ?? "",
                  email: salon.user?.email ?? "",
                  phone: salon.phone ?? "",
                  city:  salon.city ?? "",
                }}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
