"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { PartnerCard } from "./PartnerCard";
import type { Partner } from "@/lib/partners";

const CATEGORIES = ["brand", "school", "tech", "industry"] as const;

const CATEGORY_LABELS: Record<string, Record<string, string>> = {
  brand: { fr: "Marque", en: "Brand" },
  school: { fr: "École", en: "School" },
  tech: { fr: "Technologie", en: "Tech" },
  industry: { fr: "Industrie", en: "Industry" },
};

const TIERS = ["SIGNATURE", "VEDETTE", "DECOUVERTE"] as const;

const TIER_LABELS: Record<string, Record<string, string>> = {
  SIGNATURE: { fr: "Signature", en: "Signature" },
  VEDETTE: { fr: "Vedette", en: "Spotlight" },
  DECOUVERTE: { fr: "Découverte", en: "Discovery" },
};

export function PartnerDirectory({
  partners,
  locale,
}: {
  partners: Partner[];
  locale: string;
}) {
  const lang = locale === "en" ? "en" : "fr";
  const t = useTranslations("partners");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [tier, setTier] = useState<string | null>(null);
  const [ville, setVille] = useState("");

  const hasFilters = !!(search || category || tier || ville);

  const filtered = useMemo(() => {
    let result = partners;

    if (search) {
      const term = search.toLowerCase();
      result = result.filter((p) => {
        const tags = (() => { try { return JSON.parse(p.tags || "[]").join(" "); } catch { return ""; } })();
        return (
          p.name.toLowerCase().includes(term) ||
          p.taglineFr.toLowerCase().includes(term) ||
          p.taglineEn.toLowerCase().includes(term) ||
          tags.toLowerCase().includes(term)
        );
      });
    }

    if (category) {
      result = result.filter((p) => p.category === category);
    }

    if (tier) {
      result = result.filter((p) => p.tier === tier);
    }

    if (ville) {
      const term = ville.toLowerCase();
      result = result.filter((p) => p.city.toLowerCase().includes(term));
    }

    return result;
  }, [partners, search, category, tier, ville]);

  function resetFilters() {
    setSearch("");
    setCategory(null);
    setTier(null);
    setVille("");
  }

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <div className="sticky top-16 z-10 bg-white/95 backdrop-blur-sm py-4 -mx-4 px-4 border-b border-[#CBBBA6]/30">
        <div className="flex flex-col gap-3">
          {/* Search row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4a6260]" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("search_placeholder")}
                className="pl-9"
              />
            </div>
            <div className="relative sm:w-48">
              <Input
                value={ville}
                onChange={(e) => setVille(e.target.value)}
                placeholder={t("filter_ville")}
              />
            </div>
          </div>

          {/* Category + tier pills */}
          <div className="flex gap-3 flex-wrap items-center">
            {/* Categories */}
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => setCategory(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  !category
                    ? "bg-[#055864] text-white"
                    : "bg-gray-100 text-[#4a6260] hover:bg-gray-200"
                }`}
              >
                {t("all")}
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(category === cat ? null : cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    category === cat
                      ? "bg-[#055864] text-white"
                      : "bg-gray-100 text-[#4a6260] hover:bg-gray-200"
                  }`}
                >
                  {CATEGORY_LABELS[cat][lang]}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="hidden sm:block h-5 w-px bg-[#CBBBA6]/60" />

            {/* Tier filter */}
            <div className="flex gap-1.5 flex-wrap">
              <span className="text-xs text-[#4a6260] self-center mr-1">{t("filter_plan")}:</span>
              {TIERS.map((t_tier) => (
                <button
                  key={t_tier}
                  onClick={() => setTier(tier === t_tier ? null : t_tier)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    tier === t_tier
                      ? "bg-[#055864] text-white"
                      : "bg-gray-100 text-[#4a6260] hover:bg-gray-200"
                  }`}
                >
                  {TIER_LABELS[t_tier][lang]}
                </button>
              ))}
            </div>

            {/* Reset */}
            {hasFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-xs text-[#4a6260] hover:text-[#055864] transition-colors ml-auto"
              >
                <X className="h-3 w-3" />
                {t("filter_reset")}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-[#4a6260] text-sm">{t("no_results")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((partner) => (
            <PartnerCard key={partner.id} partner={partner} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
