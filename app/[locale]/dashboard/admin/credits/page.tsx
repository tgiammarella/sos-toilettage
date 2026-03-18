export const dynamic = "force-dynamic";

import { requireRole } from "@/lib/auth-guards";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminCreditsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireRole(locale, "ADMIN");
  const t = await getTranslations({ locale, namespace: "dashboard.admin" });

  const [ledger, salons] = await Promise.all([
    prisma.creditLedger.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { salon: { select: { name: true } } },
    }),
    prisma.salonProfile.findMany({
      orderBy: { creditsAvailable: "desc" },
      take: 10,
      select: { id: true, name: true, creditsAvailable: true, planKey: true },
    }),
  ]);

  const reasonLabel = (reason: string) => {
    if (locale !== "fr") return reason;
    const map: Record<string, string> = {
      PACK_PURCHASE:    "Offre découverte",
      MONTHLY_GRANT:    "Abonnement mensuel",
      SHIFT_PUBLISHED:  "Remplacement publié",
      ADMIN_ADJUSTMENT: "Ajustement admin",
    };
    return map[reason] ?? reason;
  };

  const planLabel = (planKey: string) => {
    if (planKey === "NONE" || !planKey) return null;
    if (locale !== "fr") return planKey;
    const map: Record<string, string> = {
      STARTER: "Starter",
      SALON:   "Salon",
      RESEAU:  "Réseau",
      CHAINE:  "Chaîne",
    };
    return map[planKey] ?? planKey;
  };

  return (
    <AdminShell locale={locale}>
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-[#1F2933]">{t("credits")}</h1>

        {/* Top salons by credits */}
        <Card className="border shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t("credits_top_salons")}</CardTitle>
          </CardHeader>
          <CardContent className="pb-4 space-y-2">
            {salons.map((s) => {
              const plan = planLabel(s.planKey);
              return (
                <div key={s.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{s.name}</span>
                  <div className="flex items-center gap-3">
                    {plan && <Badge variant="outline" className="text-xs">{plan}</Badge>}
                    <span className="font-bold text-primary">{s.creditsAvailable}</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Full ledger */}
        <section>
          <h2 className="text-lg font-semibold mb-3">
            {locale === "fr" ? "Dernières transactions" : "Recent transactions"}
          </h2>
          <div className="space-y-2">
            {ledger.map((entry) => (
              <Card key={entry.id} className="border shadow-none">
                <CardContent className="py-3 px-5 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{entry.salon.name}</p>
                    <p className="text-xs text-muted-foreground">{reasonLabel(entry.reason)}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-sm font-bold ${entry.type === "CREDIT" ? "text-emerald-600" : "text-destructive"}`}>
                      {entry.type === "CREDIT" ? "+" : ""}{entry.amount}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
