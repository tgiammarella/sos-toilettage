"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { PartnerCard } from "./PartnerCard";
import type { Partner } from "@/lib/partners";

function useDebounce<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    timer.current = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(timer.current);
  }, [value, ms]);
  return debounced;
}

export function PartnerDirectory({
  partners,
  locale,
}: {
  partners: Partner[];
  locale: string;
}) {
  const t = useTranslations("partners");
  const [search, setSearch] = useState("");
  const [ville, setVille] = useState("");

  const debouncedSearch = useDebounce(search, 300);
  const debouncedVille = useDebounce(ville, 300);

  const filtered = useMemo(() => {
    let result = partners;

    if (debouncedSearch) {
      const term = debouncedSearch.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(term));
    }

    if (debouncedVille) {
      const term = debouncedVille.toLowerCase();
      result = result.filter((p) => p.city.toLowerCase().includes(term));
    }

    return result;
  }, [partners, debouncedSearch, debouncedVille]);

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <div className="sticky top-16 z-10 bg-white/95 backdrop-blur-sm py-4 -mx-4 px-4 border-b border-[#CBBBA6]/30">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 sm:flex-[3]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4a6260]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("search_placeholder")}
              className="pl-9"
            />
          </div>
          <div className="sm:flex-1">
            <Input
              value={ville}
              onChange={(e) => setVille(e.target.value)}
              placeholder={t("filter_ville")}
            />
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
