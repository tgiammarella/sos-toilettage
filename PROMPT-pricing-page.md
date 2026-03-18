# Claude Code Prompt — Pricing Page & Nav Link
# SOS Toilettage · Copy and paste this entire prompt into Claude Code

---

Implement the pricing page and nav link for SOS Toilettage. Follow all CLAUDE.md constraints exactly. Do not re-explain architecture. Provide only the implementation.

---

## 1. Create `lib/pricing.ts`

Create this file with all pricing constants. This is the single source of truth — the page and any future Stripe config will import from here.

```ts
// lib/pricing.ts

export const DECOUVERTE_PACK = {
  credits: 3,
  priceCAD: 29,
  pricePerCredit: 9.67,
  validityMonths: 12,
} as const;

export type TierKey = "ESSENTIEL" | "SALON" | "RESEAU" | "CHAINE";

export interface PricingTier {
  key: TierKey;
  monthlyPriceCAD: number;
  annualPriceCAD: number;        // annual total (monthly × 10 — 17% off)
  annualMonthlyCAD: number;      // per-month when billed annually
  creditsPerMonth: number;
  pricePerCreditIncluded: number;
  extraCreditPriceCAD: number;
  maxSalonProfiles: number;
  creditPooled: boolean;
  rolloverMonths: number;
  maxRolloverCredits: number;
  priorityLevel: 0 | 1 | 2;     // 0=standard, 1=priority, 2=top
  hasStats: boolean;
  hasPrioritySupport: boolean;
  hasDedicatedManager: boolean;
  hasApi: boolean;
  recommended: boolean;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    key: "ESSENTIEL",
    monthlyPriceCAD: 59,
    annualPriceCAD: 590,
    annualMonthlyCAD: 49,
    creditsPerMonth: 8,
    pricePerCreditIncluded: 7.38,
    extraCreditPriceCAD: 8.50,
    maxSalonProfiles: 1,
    creditPooled: false,
    rolloverMonths: 3,
    maxRolloverCredits: 24,
    priorityLevel: 0,
    hasStats: false,
    hasPrioritySupport: false,
    hasDedicatedManager: false,
    hasApi: false,
    recommended: false,
  },
  {
    key: "SALON",
    monthlyPriceCAD: 109,
    annualPriceCAD: 1090,
    annualMonthlyCAD: 91,
    creditsPerMonth: 18,
    pricePerCreditIncluded: 6.06,
    extraCreditPriceCAD: 7.50,
    maxSalonProfiles: 2,
    creditPooled: false,
    rolloverMonths: 3,
    maxRolloverCredits: 54,
    priorityLevel: 1,
    hasStats: true,
    hasPrioritySupport: false,
    hasDedicatedManager: false,
    hasApi: false,
    recommended: true,
  },
  {
    key: "RESEAU",
    monthlyPriceCAD: 199,
    annualPriceCAD: 1990,
    annualMonthlyCAD: 166,
    creditsPerMonth: 35,
    pricePerCreditIncluded: 5.69,
    extraCreditPriceCAD: 6.50,
    maxSalonProfiles: 5,
    creditPooled: true,
    rolloverMonths: 3,
    maxRolloverCredits: 105,
    priorityLevel: 2,
    hasStats: true,
    hasPrioritySupport: true,
    hasDedicatedManager: false,
    hasApi: false,
    recommended: false,
  },
  {
    key: "CHAINE",
    monthlyPriceCAD: 349,
    annualPriceCAD: 3490,
    annualMonthlyCAD: 291,
    creditsPerMonth: 70,
    pricePerCreditIncluded: 4.99,
    extraCreditPriceCAD: 5.50,
    maxSalonProfiles: 999,        // unlimited
    creditPooled: true,
    rolloverMonths: 3,
    maxRolloverCredits: 210,
    priorityLevel: 2,
    hasStats: true,
    hasPrioritySupport: true,
    hasDedicatedManager: true,
    hasApi: true,
    recommended: false,
  },
];
```

---

## 2. Add i18n keys

### `messages/fr.json` — add inside the root object:

```json
"nav": {
  // ... keep all existing keys, add:
  "pricing": "Tarifs"
},
"pricing": {
  "meta": {
    "title": "Tarifs — SOS Toilettage",
    "description": "Choisissez le plan adapté à votre salon. Un seul crédit pour publier un remplacement."
  },
  "hero": {
    "badge": "Tarification transparente",
    "title": "Un crédit protège une journée de revenus",
    "subtitle": "Chaque remplacement trouvé via SOS Toilettage protège entre 300 $ et 700 $ de chiffre d'affaires. Commencez avec 3 crédits, abonnez-vous quand vous êtes prêt.",
    "taxNote": "Tous les prix en CAD, avant taxes (TPS 5 % + TVQ 9,975 %)"
  },
  "toggle": {
    "monthly": "Mensuel",
    "annual": "Annuel",
    "save": "Économisez 17 %"
  },
  "decouverte": {
    "badge": "Commencez ici",
    "title": "Pack Découverte",
    "credits": "3 crédits",
    "price": "29 $",
    "priceNote": "achat unique · sans engagement",
    "perCredit": "9,67 $ / crédit",
    "validity": "Valide 12 mois",
    "noCommitment": "Aucun abonnement requis",
    "cta": "Acheter le pack",
    "description": "Testez la plateforme. Publiez 3 remplacements et voyez la qualité des candidatures avant de vous engager."
  },
  "tiers": {
    "ESSENTIEL": {
      "name": "Essentiel",
      "target": "Salon solo · 1 emplacement",
      "cta": "Démarrer"
    },
    "SALON": {
      "name": "Salon",
      "target": "Salon établi · 1-2 emplacements",
      "cta": "Choisir ce plan",
      "badge": "Le plus populaire"
    },
    "RESEAU": {
      "name": "Réseau",
      "target": "Réseau régional · jusqu'à 5 sites",
      "cta": "Nous contacter"
    },
    "CHAINE": {
      "name": "Chaîne",
      "target": "Grande chaîne · 8+ emplacements",
      "cta": "Nous contacter"
    }
  },
  "features": {
    "creditsPerMonth": "{n} crédits / mois",
    "perCredit": "{price} $ / crédit inclus",
    "extraCredit": "Crédit suppl. : {price} $",
    "profiles": "{n} profil salon",
    "profilesPlural": "{n} profils salon",
    "profilesUnlimited": "Profils illimités",
    "creditPool": "Crédits poolés entre sites",
    "rollover": "Report jusqu'à 3 mois",
    "stats": "Statistiques et rapports",
    "priorityListing": "Affichage prioritaire",
    "topListing": "Affichage en tête de liste",
    "prioritySupport": "Support prioritaire (< 24 h)",
    "dedicatedManager": "Gestionnaire de compte dédié",
    "api": "API + export CSV",
    "jobPosts": "Publications d'emploi incluses"
  },
  "perMonth": "/ mois",
  "billedAnnually": "facturé annuellement",
  "billedMonthly": "facturé mensuellement",
  "recommended": "Recommandé",
  "faq": {
    "title": "Questions fréquentes",
    "q1": "Qu'est-ce qu'un crédit?",
    "a1": "Un crédit = une publication de remplacement ou d'offre d'emploi. Chaque publication coûte 1 crédit, peu importe la durée ou le nombre de candidatures reçues.",
    "q2": "Les crédits non utilisés expirent-ils?",
    "a2": "Les crédits d'abonnement se reportent jusqu'à 3 mois (selon votre palier). Les crédits du Pack Découverte sont valides 12 mois.",
    "q3": "Puis-je changer de palier?",
    "a3": "Oui, en tout temps. La mise à niveau est immédiate. Le rétrogradage prend effet au prochain cycle de facturation.",
    "q4": "Comment fonctionnent les crédits poolés (Réseau et Chaîne)?",
    "a4": "Tous vos emplacements partagent un seul solde de crédits. Un emplacement peut utiliser les crédits d'un autre si l'un est plus actif ce mois-là."
  }
}
```

### `messages/en.json` — add inside the root object:

```json
"nav": {
  // ... keep all existing keys, add:
  "pricing": "Pricing"
},
"pricing": {
  "meta": {
    "title": "Pricing — SOS Toilettage",
    "description": "Choose the right plan for your salon. One credit to publish a replacement shift."
  },
  "hero": {
    "badge": "Transparent pricing",
    "title": "One credit protects a full day of revenue",
    "subtitle": "Every replacement found through SOS Toilettage protects $300–$700 in daily revenue. Start with 3 credits, subscribe when ready.",
    "taxNote": "All prices in CAD, before taxes (GST 5% + QST 9.975%)"
  },
  "toggle": {
    "monthly": "Monthly",
    "annual": "Annual",
    "save": "Save 17%"
  },
  "decouverte": {
    "badge": "Start here",
    "title": "Découverte Pack",
    "credits": "3 credits",
    "price": "$29",
    "priceNote": "one-time · no commitment",
    "perCredit": "$9.67 / credit",
    "validity": "Valid 12 months",
    "noCommitment": "No subscription required",
    "cta": "Buy the pack",
    "description": "Test the platform. Publish 3 replacements and see the quality of applicants before committing."
  },
  "tiers": {
    "ESSENTIEL": {
      "name": "Essentiel",
      "target": "Solo salon · 1 location",
      "cta": "Get started"
    },
    "SALON": {
      "name": "Salon",
      "target": "Established salon · 1-2 locations",
      "cta": "Choose this plan",
      "badge": "Most popular"
    },
    "RESEAU": {
      "name": "Réseau",
      "target": "Regional network · up to 5 locations",
      "cta": "Contact us"
    },
    "CHAINE": {
      "name": "Chaîne",
      "target": "Large chain · 8+ locations",
      "cta": "Contact us"
    }
  },
  "features": {
    "creditsPerMonth": "{n} credits / month",
    "perCredit": "${price} / credit included",
    "extraCredit": "Extra credit: ${price}",
    "profiles": "{n} salon profile",
    "profilesPlural": "{n} salon profiles",
    "profilesUnlimited": "Unlimited profiles",
    "creditPool": "Credits pooled across locations",
    "rollover": "Roll over up to 3 months",
    "stats": "Analytics & reports",
    "priorityListing": "Priority listing",
    "topListing": "Top of search results",
    "prioritySupport": "Priority support (< 24 h)",
    "dedicatedManager": "Dedicated account manager",
    "api": "API + CSV export",
    "jobPosts": "Job posts included"
  },
  "perMonth": "/ mo",
  "billedAnnually": "billed annually",
  "billedMonthly": "billed monthly",
  "recommended": "Recommended",
  "faq": {
    "title": "Frequently asked questions",
    "q1": "What is a credit?",
    "a1": "One credit = one shift or job post. Each posting costs 1 credit, regardless of duration or number of applicants received.",
    "q2": "Do unused credits expire?",
    "a2": "Subscription credits roll over for up to 3 months (depending on your plan). Découverte Pack credits are valid for 12 months.",
    "q3": "Can I change plans?",
    "a3": "Yes, at any time. Upgrades take effect immediately. Downgrades take effect at the next billing cycle.",
    "q4": "How do pooled credits work (Réseau and Chaîne)?",
    "a4": "All your locations share one credit balance. A busier location can draw from the shared pool if another location has a quieter month."
  }
}
```

---

## 3. Create the pricing page

### Directory and file

```bash
mkdir -p "app/[locale]/pricing"
```

Create `app/[locale]/pricing/page.tsx` as a **client component** (needs the billing toggle interaction):

```tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DECOUVERTE_PACK, PRICING_TIERS, type PricingTier } from "@/lib/pricing";

export default function PricingPage() {
  const t = useTranslations("pricing");
  const [annual, setAnnual] = useState(false);

  return (
    <main className="min-h-screen bg-white">
      {/* ── Hero ── */}
      <section className="bg-gradient-to-b from-teal-50 to-white px-4 py-16 text-center">
        <Badge className="mb-4 bg-teal-100 text-teal-800 hover:bg-teal-100">
          {t("hero.badge")}
        </Badge>
        <h1 className="mx-auto mb-4 max-w-2xl text-4xl font-bold tracking-tight text-slate-900">
          {t("hero.title")}
        </h1>
        <p className="mx-auto mb-6 max-w-xl text-lg text-slate-600">
          {t("hero.subtitle")}
        </p>
        <p className="text-sm text-slate-400">{t("hero.taxNote")}</p>
      </section>

      <div className="mx-auto max-w-6xl px-4 pb-24">

        {/* ── Billing toggle ── */}
        <div className="mb-10 flex items-center justify-center gap-4">
          <span className={`text-sm font-medium ${!annual ? "text-slate-900" : "text-slate-400"}`}>
            {t("toggle.monthly")}
          </span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              annual ? "bg-teal-600" : "bg-slate-300"
            }`}
            aria-label="Toggle annual billing"
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              annual ? "translate-x-6" : "translate-x-1"
            }`} />
          </button>
          <span className={`flex items-center gap-2 text-sm font-medium ${annual ? "text-slate-900" : "text-slate-400"}`}>
            {t("toggle.annual")}
            <Badge className="bg-teal-600 text-white hover:bg-teal-600 text-xs">
              {t("toggle.save")}
            </Badge>
          </span>
        </div>

        {/* ── Découverte Pack ── */}
        <div className="mb-12 rounded-2xl border-2 border-dashed border-teal-200 bg-teal-50 p-6 md:flex md:items-center md:justify-between md:gap-8">
          <div className="mb-4 md:mb-0">
            <Badge className="mb-2 bg-teal-600 text-white hover:bg-teal-600">
              {t("decouverte.badge")}
            </Badge>
            <h2 className="mb-1 text-xl font-bold text-slate-900">
              {t("decouverte.title")}
            </h2>
            <p className="mb-3 text-sm text-slate-600">{t("decouverte.description")}</p>
            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
              <span>✓ {t("decouverte.validity")}</span>
              <span>✓ {t("decouverte.noCommitment")}</span>
              <span>✓ {t("decouverte.perCredit")}</span>
            </div>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end md:text-right">
            <div>
              <span className="text-4xl font-bold text-slate-900">{t("decouverte.price")}</span>
              <p className="text-sm text-slate-500">{t("decouverte.credits")} · {t("decouverte.priceNote")}</p>
            </div>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white">
              <Zap className="mr-2 h-4 w-4" />
              {t("decouverte.cta")}
            </Button>
          </div>
        </div>

        {/* ── Membership Tiers ── */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {PRICING_TIERS.map((tier) => (
            <TierCard key={tier.key} tier={tier} annual={annual} t={t} />
          ))}
        </div>

        {/* ── FAQ ── */}
        <section className="mt-20">
          <h2 className="mb-8 text-center text-2xl font-bold text-slate-900">
            {t("faq.title")}
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {(["q1", "q2", "q3", "q4"] as const).map((qKey) => (
              <div key={qKey} className="rounded-xl border border-slate-100 bg-slate-50 p-5">
                <p className="mb-2 font-semibold text-slate-900">{t(`faq.${qKey}`)}</p>
                <p className="text-sm text-slate-600">
                  {t(`faq.${qKey.replace("q", "a") as "a1" | "a2" | "a3" | "a4"}`)}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

// ── TierCard sub-component ───────────────────────────────────────────────────

function TierCard({
  tier,
  annual,
  t,
}: {
  tier: PricingTier;
  annual: boolean;
  t: ReturnType<typeof useTranslations<"pricing">>;
}) {
  const price = annual ? tier.annualMonthlyCAD : tier.monthlyPriceCAD;
  const billingLabel = annual ? t("billedAnnually") : t("billedMonthly");
  const isChaine = tier.key === "CHAINE";
  const isReseau = tier.key === "RESEAU";

  const features: string[] = [
    `${tier.creditsPerMonth} crédits / mois`,
    `${tier.pricePerCreditIncluded.toFixed(2).replace(".", ",")} $ / crédit inclus`,
    `Crédit suppl. : ${tier.extraCreditPriceCAD.toFixed(2).replace(".", ",")} $`,
    tier.maxSalonProfiles >= 999
      ? t("features.profilesUnlimited")
      : tier.maxSalonProfiles === 1
      ? t("features.profiles", { n: tier.maxSalonProfiles })
      : t("features.profilesPlural", { n: tier.maxSalonProfiles }),
    t("features.jobPosts"),
    t("features.rollover"),
  ];

  if (tier.creditPooled) features.push(t("features.creditPool"));
  if (tier.priorityLevel === 1) features.push(t("features.priorityListing"));
  if (tier.priorityLevel === 2) features.push(t("features.topListing"));
  if (tier.hasStats) features.push(t("features.stats"));
  if (tier.hasPrioritySupport) features.push(t("features.prioritySupport"));
  if (tier.hasDedicatedManager) features.push(t("features.dedicatedManager"));
  if (tier.hasApi) features.push(t("features.api"));

  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-6 transition-shadow hover:shadow-md ${
        tier.recommended
          ? "border-teal-500 shadow-md ring-2 ring-teal-500"
          : "border-slate-200"
      }`}
    >
      {tier.recommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-teal-600 text-white hover:bg-teal-600 px-3 py-1">
            {t("recommended")}
          </Badge>
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900">
          {t(`tiers.${tier.key}.name`)}
        </h3>
        <p className="text-xs text-slate-500">{t(`tiers.${tier.key}.target`)}</p>
      </div>

      <div className="mb-6">
        <div className="flex items-end gap-1">
          {isChaine ? (
            <span className="text-3xl font-bold text-slate-900">{price} $+</span>
          ) : (
            <span className="text-3xl font-bold text-slate-900">{price} $</span>
          )}
          <span className="mb-1 text-sm text-slate-500">{t("perMonth")}</span>
        </div>
        <p className="text-xs text-slate-400">{billingLabel}</p>
        {annual && (
          <p className="text-xs text-teal-600 font-medium">
            {tier.annualPriceCAD} $ / an
          </p>
        )}
      </div>

      <ul className="mb-6 flex-1 space-y-2">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-500" />
            {f}
          </li>
        ))}
      </ul>

      <Button
        variant={tier.recommended ? "default" : "outline"}
        className={
          tier.recommended
            ? "bg-teal-600 text-white hover:bg-teal-700 w-full"
            : "w-full"
        }
      >
        {t(`tiers.${tier.key}.cta`)}
      </Button>
    </div>
  );
}
```

---

## 4. Update `components/nav/Navbar.tsx`

Add "Tarifs" / "Pricing" link to the public nav links array (alongside Remplacements, Offres d'emploi, Écoles). It must appear between the last public nav link and the auth buttons.

Find the section that renders the public nav links. Add this link in the same pattern as the others:

```tsx
<Link href={`/${locale}/pricing`} className={/* same className as existing nav links */}>
  {t("nav.pricing")}
</Link>
```

Match the exact className pattern used by the adjacent `nav.shifts` and `nav.jobs` links. Do not change any other part of the component.

---

## 5. Generate metadata for the pricing page

Add a `generateMetadata` export at the top of `app/[locale]/pricing/page.tsx` — but since the page is a client component, create a separate `app/[locale]/pricing/layout.tsx` server component for metadata:

```tsx
// app/[locale]/pricing/layout.tsx
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pricing.meta" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

---

## 6. Verify build

```bash
npm run build
```

Resolve all TypeScript errors before declaring done. Zero build errors required.

---

## Constraints reminder

- `mkdir -p "app/[locale]/pricing"` — quoted, no brace expansion
- No client-only role checks — the pricing page is public (no auth required)
- Keep business logic (pricing constants) in `lib/pricing.ts`, not in the component
- Do not touch any credit deduction logic, API routes, or Prisma schema — this is UI only
```
