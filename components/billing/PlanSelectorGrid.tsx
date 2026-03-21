"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { PRICING_TIERS } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { toast } from "sonner";

interface PlanSelectorGridProps {
  currentPlanKey: string;
  locale: string;
}

export function PlanSelectorGrid({ currentPlanKey, locale }: PlanSelectorGridProps) {
  const t = useTranslations("dashboard.salon");
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function selectPlan(planKey: string) {
    if (planKey === currentPlanKey) return;
    setLoading(planKey);
    try {
      const res = await fetch("/api/billing/select-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey }),
      });
      if (res.ok) {
        toast.success(t("billing_plan_success"));
        router.refresh();
      } else {
        toast.error(locale === "fr" ? "Erreur lors de la sélection du forfait." : "Error selecting plan.");
      }
    } catch {
      toast.error(locale === "fr" ? "Erreur réseau." : "Network error.");
    } finally {
      setLoading(null);
    }
  }

  const planNames: Record<string, { fr: string; en: string }> = {
    ESSENTIEL: { fr: "Essentiel",      en: "Essentiel" },
    SALON:     { fr: "Professionnel",  en: "Professionnel" },
    RESEAU:    { fr: "Réseau",         en: "Réseau" },
    CHAINE:    { fr: "Entreprise",     en: "Entreprise" },
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {PRICING_TIERS.map((tier) => {
        const isCurrent = tier.key === currentPlanKey;
        const isChaine = tier.key === "CHAINE";
        const name = planNames[tier.key]?.[locale === "fr" ? "fr" : "en"] ?? tier.key;

        return (
          <div
            key={tier.key}
            className={`relative flex flex-col rounded-xl border p-5 bg-card transition-shadow ${
              isCurrent
                ? "border-primary ring-2 ring-primary shadow-md"
                : tier.recommended
                ? "border-accent shadow-sm"
                : "border-border shadow-sm hover:shadow-md"
            }`}
          >
            {isCurrent && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground text-xs px-2 py-0.5 shadow-sm">
                  {t("billing_plan_current")}
                </Badge>
              </span>
            )}
            {tier.recommended && !isCurrent && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-accent text-accent-foreground text-xs px-2 py-0.5 shadow-sm">
                  {locale === "fr" ? "Populaire" : "Popular"}
                </Badge>
              </span>
            )}

            <h3 className="font-bold text-base text-foreground mb-0.5">{name}</h3>
            <p className="text-2xl font-bold text-foreground mb-1">
              {tier.monthlyPriceCAD} $
              <span className="text-xs font-normal text-muted-foreground ml-1">
                / {locale === "fr" ? "mois" : "mo"}
              </span>
            </p>
            <p className="text-xs text-accent font-semibold mb-4">
              {tier.creditsPerMonth} {t("billing_plan_credits")}
            </p>

            <ul className="mb-5 space-y-1.5 flex-1">
              {[
                `${tier.creditsPerMonth} ${locale === "fr" ? "crédits/mois" : "credits/mo"}`,
                `${locale === "fr" ? "Crédit suppl." : "Extra credit"}: ${tier.extraCreditPriceCAD.toFixed(2)} $`,
                tier.maxSalonProfiles >= 999
                  ? (locale === "fr" ? "Profils illimités" : "Unlimited profiles")
                  : `${tier.maxSalonProfiles} ${locale === "fr" ? "profil(s) salon" : "salon profile(s)"}`,
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-foreground">
                  <Check className="h-3.5 w-3.5 mt-0.5 shrink-0 text-accent" />
                  {f}
                </li>
              ))}
            </ul>

            <Button
              size="sm"
              variant={isCurrent ? "secondary" : tier.recommended ? "default" : "outline"}
              className="w-full"
              disabled={isCurrent || loading === tier.key || isChaine}
              onClick={() => selectPlan(tier.key)}
            >
              {loading === tier.key
                ? "…"
                : isCurrent
                ? t("billing_plan_current")
                : isChaine
                ? (locale === "fr" ? "Nous contacter" : "Contact us")
                : t("billing_plan_select")}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
