export const dynamic = "force-dynamic";

import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Coins, CreditCard, Calendar, Tag } from "lucide-react";
import { SalonSidebar } from "@/components/dashboard/SalonSidebar";
import { ApplyCouponForm } from "@/components/billing/ApplyCouponForm";
import { PlanSelectorGrid } from "@/components/billing/PlanSelectorGrid";

function formatReason(reason: string, locale: string): string {
  if (locale !== "fr") return reason;
  if (reason === "PACK_PURCHASE")    return "Offre découverte";
  if (reason === "MONTHLY_GRANT")    return "Abonnement mensuel";
  if (reason === "SHIFT_PUBLISHED")  return "Remplacement publié";
  if (reason === "URGENT_PRIORITY")  return "Priorité urgente";
  if (reason === "URGENT_UPGRADE")   return "Mise à niveau urgente";
  if (reason === "ADMIN_ADJUSTMENT") return "Ajustement admin";
  if (reason.startsWith("COUPON:"))       return `Code promo : ${reason.slice(7)}`;
  if (reason.startsWith("COUPON_PLAN:"))  return `Forfait promo : ${reason.split(":")[2] ?? ""}`;
  if (reason.startsWith("PLAN_SELECTED:")) return `Forfait sélectionné : ${reason.split(":")[1] ?? ""}`;
  return reason;
}

const PLAN_LABELS: Record<string, { fr: string; en: string }> = {
  ESSENTIEL: { fr: "Essentiel",     en: "Essential" },
  SALON:     { fr: "Salon",         en: "Salon" },
  RESEAU:    { fr: "Réseau",        en: "Network" },
  CHAINE:    { fr: "Chaîne",        en: "Chain" },
  NONE:      { fr: "Aucun forfait", en: "No plan" },
};

export default async function SalonBillingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await requireRole(locale, "SALON");
  const t = await getTranslations({ locale, namespace: "dashboard.salon" });

  const salon = await prisma.salonProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      name: true,
      planKey: true,
      creditsAvailable: true,
      creditsMonthlyAllowance: true,
      nextRenewalAt: true,
      createdAt: true,
      creditLedger: {
        orderBy: { createdAt: "desc" },
        take: 30,
        include: {
          shift: { select: { city: true, date: true } },
        },
      },
    },
  });

  if (!salon) notFound();

  // Fallback renewal date: createdAt + 30d when plan is active but nextRenewalAt not yet set
  const renewalDate = salon.nextRenewalAt
    ?? (salon.planKey !== "NONE"
      ? new Date(salon.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000)
      : null);

  const planLabel =
    PLAN_LABELS[salon.planKey]?.[locale === "fr" ? "fr" : "en"] ?? salon.planKey;

  const dateLocale = locale === "fr" ? "fr-CA" : "en-CA";

  return (
    <div className="flex min-h-screen bg-muted/30">
      <SalonSidebar locale={locale} salonName={salon.name} />

      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* ── Header ── */}
          <div>
            <h1 className="text-2xl font-bold text-[#1F2933]">{t("billing")}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {locale === "fr"
                ? "Gérez votre forfait, vos crédits et vos codes promotionnels."
                : "Manage your plan, credits, and promo codes."}
            </p>
          </div>

          {/* ── Summary cards ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border shadow-none">
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CreditCard className="h-4 w-4" />
                  {t("billing_plan")}
                </div>
              </CardHeader>
              <CardContent className="pb-4 px-4">
                <Badge variant={salon.planKey === "NONE" ? "outline" : "default"} className="text-sm">
                  {planLabel}
                </Badge>
              </CardContent>
            </Card>

            <Card className="border shadow-none">
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Coins className="h-4 w-4" />
                  {t("credits_available")}
                </div>
              </CardHeader>
              <CardContent className="pb-4 px-4">
                <p className="text-2xl font-bold">{salon.creditsAvailable}</p>
              </CardContent>
            </Card>

            <Card className="border shadow-none">
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Coins className="h-4 w-4 opacity-50" />
                  {t("billing_credits_monthly")}
                </div>
              </CardHeader>
              <CardContent className="pb-4 px-4">
                <p className="text-2xl font-bold">{salon.creditsMonthlyAllowance}</p>
              </CardContent>
            </Card>

            <Card className="border shadow-none">
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {t("billing_renewal")}
                </div>
              </CardHeader>
              <CardContent className="pb-4 px-4">
                <p className="text-sm font-semibold">
                  {renewalDate
                    ? renewalDate.toLocaleDateString(dateLocale, {
                        day: "numeric", month: "short", year: "numeric",
                      })
                    : t("billing_plan_renewal_none")}
                </p>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* ── Coupon ── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Tag className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold">{t("billing_coupon_title")}</h2>
            </div>
            <div className="max-w-sm">
              <ApplyCouponForm />
            </div>
          </section>

          <Separator />

          {/* ── Plan selector ── */}
          <section>
            <h2 className="text-lg font-semibold mb-4">{t("billing_plan_title")}</h2>
            <PlanSelectorGrid currentPlanKey={salon.planKey} locale={locale} />
          </section>

          <Separator />

          {/* ── Credit ledger ── */}
          <section>
            <h2 className="text-lg font-semibold mb-4">{t("billing_ledger_title")}</h2>
            {salon.creditLedger.length === 0 ? (
              <Card className="border-dashed shadow-none">
                <CardContent className="py-10 text-center text-muted-foreground text-sm">
                  {t("billing_ledger_empty")}
                </CardContent>
              </Card>
            ) : (
              <div className="rounded-xl border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground w-32">
                        {t("billing_ledger_date")}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                        {t("billing_ledger_reason")}
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-muted-foreground w-20">
                        {t("billing_ledger_amount")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {salon.creditLedger.map((entry, i) => (
                      <tr key={entry.id} className={`border-t border-border ${i % 2 !== 0 ? "bg-muted/20" : ""}`}>
                        <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                          {new Date(entry.createdAt).toLocaleDateString(dateLocale, {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium">{formatReason(entry.reason, locale)}</span>
                          {entry.shift && (
                            <span className="ml-2 text-muted-foreground text-xs">
                              — {entry.shift.city}{" "}
                              {new Date(entry.shift.date).toLocaleDateString(dateLocale, {
                                day: "numeric", month: "short",
                              })}
                            </span>
                          )}
                        </td>
                        <td className={`py-3 px-4 text-right font-bold ${
                          entry.type === "CREDIT" ? "text-emerald-600" : "text-destructive"
                        }`}>
                          {entry.type === "CREDIT" ? "+" : ""}{entry.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}
