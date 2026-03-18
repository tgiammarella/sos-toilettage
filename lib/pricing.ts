// lib/pricing.ts

export const DECOUVERTE_PACK = {
  credits: 3,
  priceCAD: 29,
  pricePerCredit: 9.67,
  validityMonths: 12,
} as const;

export const JOB_POSTING = {
  priceCAD: 49,
  durationDays: 30,
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
