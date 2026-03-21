"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";
import { PRICING_TIERS, type PricingTier } from "@/lib/pricing";

export function PricingPlansSection({ locale }: { locale: string }) {
  const t = useTranslations("pricing");
  const [annual, setAnnual] = useState(false);

  return (
    <section id="plans" className="bg-background px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-[#1F2933] mb-3">
          {t("plans_title")}
        </h2>
        <p className="text-center text-[#4a6260] mb-8 text-sm">
          {t("plans_subtitle")}
        </p>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <span className={`text-sm font-medium ${!annual ? "text-foreground" : "text-muted-foreground"}`}>
            {t("toggle.monthly")}
          </span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              annual ? "bg-primary" : "bg-border"
            }`}
            aria-label="Toggle annual billing"
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              annual ? "translate-x-6" : "translate-x-1"
            }`} />
          </button>
          <span className={`flex items-center gap-2 text-sm font-medium ${annual ? "text-foreground" : "text-muted-foreground"}`}>
            {t("toggle.annual")}
            <Badge className="bg-accent text-accent-foreground hover:bg-accent text-xs">
              {t("toggle.save")}
            </Badge>
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 items-start">
          {PRICING_TIERS.map((tier) => (
            <TierCard key={tier.key} tier={tier} annual={annual} t={t} locale={locale} />
          ))}
        </div>

        {/* Risk reduction */}
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-success-foreground shrink-0" />
          <span>{t("riskReduction")}</span>
        </div>
      </div>
    </section>
  );
}

function TierCard({
  tier,
  annual,
  t,
  locale,
}: {
  tier: PricingTier;
  annual: boolean;
  t: ReturnType<typeof useTranslations<"pricing">>;
  locale: string;
}) {
  const price = annual ? tier.annualMonthlyCAD : tier.monthlyPriceCAD;
  const billingLabel = annual ? t("billedAnnually") : t("billedMonthly");
  const isChaine = tier.key === "CHAINE";
  const hasTrial = tier.key === "ESSENTIEL" || tier.key === "SALON";

  const features: string[] = [
    t("features.creditsPerMonth", { n: tier.creditsPerMonth }),
    t("features.extraCredit", { price: tier.extraCreditPriceCAD.toFixed(2) }),
    tier.maxSalonProfiles >= 999
      ? t("features.profilesUnlimited")
      : tier.maxSalonProfiles === 1
      ? t("features.profiles", { n: tier.maxSalonProfiles })
      : t("features.profilesPlural", { n: tier.maxSalonProfiles }),
    t("features.jobPosts"),
    t("features.rollover"),
  ];

  features.push(t("features.openSlots"));
  if (tier.creditPooled)        features.push(t("features.creditPool"));
  if (tier.priorityLevel === 1) features.push(t("features.priorityListing"));
  if (tier.priorityLevel === 2) features.push(t("features.topListing"));
  if (tier.hasStats)            features.push(t("features.stats"));
  if (tier.hasPrioritySupport)  features.push(t("features.prioritySupport"));
  if (tier.hasDedicatedManager) features.push(t("features.dedicatedManager"));
  if (tier.hasApi)              features.push(t("features.api"));

  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-6 bg-white transition-shadow ${
        tier.recommended
          ? "border-accent shadow-xl ring-2 ring-accent scale-[1.02] z-10"
          : "border-border shadow-sm hover:shadow-md"
      }`}
    >
      {tier.recommended && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <Badge className="bg-accent text-accent-foreground hover:bg-accent px-3 py-1 font-semibold shadow-sm">
            {t("recommended")}
          </Badge>
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-lg font-bold text-[#1F2933]">{t(`tiers.${tier.key}.name`)}</h3>
        <p className="text-xs text-[#4a6260]">{t(`tiers.${tier.key}.target`)}</p>
      </div>

      <div className="mb-2">
        <div className="flex items-end gap-1">
          <span className="text-3xl font-bold text-[#1F2933] tabular-nums">
            {isChaine ? `${price} $+` : `${price} $`}
          </span>
          <span className="mb-1 text-sm text-[#4a6260]">{t("perMonth")}</span>
        </div>
        <p className="text-xs text-[#4a6260]">{billingLabel}</p>
        {annual && (
          <p className="text-xs text-secondary font-medium mt-0.5">
            {tier.annualPriceCAD} $ / {locale === "fr" ? "an" : "yr"}
          </p>
        )}
      </div>

      {/* Per-publication cost */}
      <p className="text-xs font-semibold text-accent mb-3">
        {t("perPublication", { price: tier.pricePerCreditIncluded.toFixed(2) })}
      </p>

      {/* Trial badge for Starter + Salon */}
      {hasTrial && (
        <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-center">
          <p className="text-xs font-medium text-emerald-700 flex items-center justify-center gap-1.5">
            <Gift className="h-3.5 w-3.5" />
            {t("trial_badge_card")}
          </p>
        </div>
      )}

      <ul className="mb-6 flex-1 space-y-2">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-foreground">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            {f}
          </li>
        ))}
      </ul>

      <div className="mt-auto">
        <Button
          variant={tier.recommended ? "default" : "outline"}
          className={tier.recommended
            ? "w-full bg-primary text-primary-foreground hover:bg-primary/90"
            : "w-full border-[1.5px] border-[#055864] text-[#055864] bg-transparent hover:bg-[#055864]/5"}
          asChild={!isChaine}
        >
          {isChaine ? (
            <span>{t(`tiers.${tier.key}.cta`)}</span>
          ) : (
            <a href={`/${locale}/auth/register`}>
              {hasTrial ? t("trial_cta") : t(`tiers.${tier.key}.cta`)}
            </a>
          )}
        </Button>
        {hasTrial && (
          <p className="text-[10px] text-[#4a6260] text-center mt-1.5">
            {t("trial_cta_note")}
          </p>
        )}
      </div>
    </div>
  );
}
