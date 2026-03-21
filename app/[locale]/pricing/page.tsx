import { getTranslations } from "next-intl/server";
import { Check, ArrowRight, Zap, FileText, Users, Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PRICING_TIERS, JOB_POSTING } from "@/lib/pricing";
import { PricingPlansSection } from "@/components/pricing/PricingPlansSection";
import { Navbar } from "@/components/nav/Navbar";
import Link from "next/link";

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pricing" });

  return (
    <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1 bg-background">

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="bg-primary text-primary-foreground px-4 py-20 text-center">
        <span className="inline-block bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full mb-6">
          {t("hero.badge")}
        </span>
        <h1 className="mx-auto mb-5 max-w-3xl text-4xl md:text-5xl font-bold leading-tight">
          {t("hero.title")}
        </h1>
        <p className="mx-auto mb-6 max-w-xl text-lg text-primary-foreground/75">
          {t("hero.subtitle")}
        </p>

        {/* Trust badges */}
        <div className="flex justify-center gap-6 mb-6 flex-wrap text-sm text-primary-foreground/80">
          {(["bullet1", "bullet2", "bullet3"] as const).map((k) => (
            <span key={k} className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-accent" /> {t(`hero.${k}`)}
            </span>
          ))}
        </div>

        {/* Trial badge */}
        <div className="mb-8">
          <span className="inline-flex items-center gap-2 bg-white/15 text-primary-foreground text-sm font-medium px-4 py-2 rounded-full">
            {t("hero.trial_badge")}
          </span>
        </div>

        <div className="flex gap-4 justify-center flex-wrap">
          <Button
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
            asChild
          >
            <a href={`/${locale}/auth/register`}>
              {t("hero.cta_primary")} <ArrowRight className="h-4 w-4 ml-2" />
            </a>
          </Button>
          <Button
            size="lg"
            className="bg-transparent border border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10"
            asChild
          >
            <a href="#plans">{t("hero.cta_secondary")}</a>
          </Button>
        </div>
        <p className="text-xs text-primary-foreground/40 mt-10">{t("hero.taxNote")}</p>
      </section>

      {/* ── Credit explainer ──────────────────────────── */}
      <section className="bg-card py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-[#1F2933] mb-12">
            {t("credits.title")}
          </h2>
          <div className="grid md:grid-cols-3 gap-6 relative">
            {[
              { icon: FileText, title: t("credits.step1_title"), desc: t("credits.step1_desc"), step: "1" },
              { icon: Zap,      title: t("credits.step2_title"), desc: t("credits.step2_desc"), step: "2" },
              { icon: Users,    title: t("credits.step3_title"), desc: t("credits.step3_desc"), step: "3" },
            ].map(({ icon: Icon, title, desc, step }, i) => (
              <div key={step} className="relative flex flex-col items-center text-center p-6 rounded-xl border border-border bg-white">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg mb-4">
                  {step}
                </div>
                <Icon className="h-6 w-6 text-accent mb-3" />
                <p className="font-semibold text-[#1F2933] mb-2">{title}</p>
                <p className="text-sm text-[#4a6260]">{desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 text-border z-10">
                    <ArrowRight className="h-6 w-6" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Reassurance — moved up from bottom of page */}
          <div className="mt-8 bg-emerald-50 border border-emerald-200 rounded-lg py-3 px-6 text-center">
            <p className="text-sm font-medium text-emerald-700">
              {t("credits.reassurance")}
            </p>
          </div>

          <p className="text-center text-sm font-medium text-secondary mt-4 bg-muted rounded-lg py-3 px-6">
            {t("credits.explanation")}
          </p>
        </div>
      </section>

      {/* ── Découverte Offer ───────────────────────────── */}
      <section className="bg-background px-4 py-10">
        <div className="max-w-4xl mx-auto rounded-2xl border-[1.5px] border-solid border-[#055864] bg-white p-6 md:flex md:items-center md:justify-between md:gap-8">
          <div className="mb-4 md:mb-0">
            <Badge className="mb-2 bg-accent text-accent-foreground hover:bg-accent/90">
              {t("decouverte.badge")}
            </Badge>
            <h2 className="mb-0.5 text-xl font-bold text-[#1F2933]">{t("decouverte.title")}</h2>
            <p className="text-sm font-medium text-[#4a6260] mb-2">{t("decouverte.subtitle")}</p>
            <p className="mb-3 text-sm text-[#4a6260]">{t("decouverte.description")}</p>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Check className="h-3.5 w-3.5 text-success-foreground" />{t("decouverte.validity")}</span>
              <span className="flex items-center gap-1"><Check className="h-3.5 w-3.5 text-success-foreground" />{t("decouverte.noCommitment")}</span>
              <span className="flex items-center gap-1"><Check className="h-3.5 w-3.5 text-success-foreground" />{t("decouverte.stackable")}</span>
              <span className="flex items-center gap-1"><Check className="h-3.5 w-3.5 text-success-foreground" />{t("decouverte.perCredit")}</span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground italic">{t("decouverte.valueNote")}</p>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end md:text-right shrink-0">
            <div>
              <span className="text-4xl font-bold text-foreground tabular-nums">{t("decouverte.price")}</span>
              <p className="text-sm text-muted-foreground">{t("decouverte.credits")} · {t("decouverte.priceNote")}</p>
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
              <a href={`/${locale}/auth/register`}>
                <Zap className="mr-2 h-4 w-4" />
                {t("decouverte.cta")}
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Standalone job posting ─────────────────────── */}
      <section className="bg-background px-4 py-10">
        <div className="max-w-4xl mx-auto rounded-2xl border-2 border-solid border-[#055864] bg-white p-6 flex flex-col">
          <p style={{ color: "#3A7F87", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 600 }} className="mb-2">
            {t("jobCard.label")}
          </p>
          <h2 className="text-2xl font-bold text-[#1F2933] mb-1">
            {t("jobCard.headline", { price: JOB_POSTING.priceCAD })}
          </h2>
          <p className="text-sm text-[#4a6260] mb-4">
            {t("jobCard.subtext", { days: JOB_POSTING.durationDays })}
          </p>
          <ul className="space-y-1.5 text-sm text-[#1F2933] mb-6">
            <li className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-[#055864] shrink-0" />
              {t("jobCard.bullet1")}
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-[#055864] shrink-0" />
              {t("jobCard.bullet2", { days: JOB_POSTING.durationDays })}
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-[#055864] shrink-0" />
              {t("jobCard.bullet3")}
            </li>
          </ul>
          <div className="mt-auto">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
              <a href={`/${locale}/auth/register`}>
                {t("jobCard.cta")}
              </a>
            </Button>
            <p className="text-[10px] text-[#4a6260] mt-1.5">
              {t("jobCard.cta_note")}
            </p>
          </div>
        </div>
      </section>

      {/* ── Social proof — launch mode ─────────────────── */}
      <section className="bg-muted py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl font-bold text-[#1F2933] mb-3">
            {t("social.title")}
          </h2>
          <p className="text-sm text-[#4a6260]">
            {t("social.launch_message")}
          </p>
        </div>
      </section>

      {/* ── Subscription plans (client — billing toggle) ─ */}
      <section id="plans" className="scroll-mt-24">
        <PricingPlansSection locale={locale} />
      </section>

      {/* ── Comparison table ───────────────────────────── */}
      <section className="bg-card py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-[#1F2933] mb-10">
            {t("comparison.title")}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground w-[35%]"></th>
                  {PRICING_TIERS.map((tier) => (
                    <th key={tier.key} className={`text-center py-3 px-4 font-semibold ${tier.recommended ? "text-primary" : "text-foreground"}`}>
                      {t(`tiers.${tier.key}.name`)}
                      {tier.recommended && (
                        <span className="ml-1 inline-block w-2 h-2 rounded-full bg-accent align-middle" />
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <ComparisonRow label={t("comparison.credits")} values={PRICING_TIERS.map(tier => `${tier.creditsPerMonth}`)} />
                <ComparisonRow label={t("comparison.locations")} values={PRICING_TIERS.map(tier => tier.maxSalonProfiles >= 999 ? t("comparison.unlimited") : `${tier.maxSalonProfiles}`)} />
                <ComparisonRow label={t("comparison.stats")} values={PRICING_TIERS.map(tier => tier.hasStats)} />
                <ComparisonRow label={t("comparison.priority_support")} values={PRICING_TIERS.map(tier => tier.hasPrioritySupport)} />
                <ComparisonRow label={t("comparison.multi_site")} values={PRICING_TIERS.map(tier => tier.creditPooled)} />
                <ComparisonRow
                  label={t("comparison.trial")}
                  values={PRICING_TIERS.map(tier => tier.key === "ESSENTIEL" || tier.key === "SALON")}
                  highlight
                />
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────── */}
      <section className="bg-background py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-[#1F2933] mb-10">
            {t("faq.title")}
          </h2>
          <div className="space-y-4">
            {(["q5", "q1", "q2", "q6", "q3", "q7", "q4"] as const).map((qKey) => {
              const aKey = qKey.replace("q", "a") as "a1" | "a2" | "a3" | "a4" | "a5" | "a6" | "a7";
              return (
                <div key={qKey} className="rounded-xl border border-border bg-white p-5 shadow-sm">
                  <p className="font-semibold text-[#1F2933] mb-2">{t(`faq.${qKey}`)}</p>
                  <p className="text-sm text-[#4a6260]">{t(`faq.${aKey}`)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────── */}
      <section className="bg-primary text-primary-foreground py-16 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">
          {t("final_cta.title")}
        </h2>
        <p className="text-primary-foreground/75 mb-8 max-w-lg mx-auto text-sm">
          {t("final_cta.subtitle")}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-start sm:items-end">
          <div className="flex flex-col items-center gap-1 self-center sm:self-auto">
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
              asChild
            >
              <Link href={`/${locale}/auth/register`}>
                {t("final_cta.primary")} <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <p className="text-xs text-primary-foreground/50">{t("final_cta.primary_note")}</p>
          </div>
          <div className="self-center sm:self-auto sm:mb-[22px]">
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10"
              asChild
            >
              <a href="#decouverte">{t("final_cta.secondary")}</a>
            </Button>
          </div>
        </div>
      </section>

    </main>
    </div>
  );
}

function ComparisonRow({ label, values, highlight }: { label: string; values: (string | boolean)[]; highlight?: boolean }) {
  return (
    <tr className={`border-b border-border last:border-0 hover:bg-muted/40 transition-colors ${highlight ? "bg-emerald-50/50" : ""}`}>
      <td className={`py-3 px-4 font-medium ${highlight ? "text-[#1F2933] font-semibold" : "text-[#4a6260]"}`}>{label}</td>
      {values.map((val, i) => (
        <td key={i} className="py-3 px-4 text-center">
          {typeof val === "boolean" ? (
            val
              ? <Check className={`h-4 w-4 mx-auto ${highlight ? "text-emerald-600" : "text-success-foreground"}`} />
              : <span className="text-muted-foreground/50 text-lg leading-none">—</span>
          ) : (
            <span className="font-medium text-foreground">{val}</span>
          )}
        </td>
      ))}
    </tr>
  );
}
