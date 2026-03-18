"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { getLabel, getLang, OPEN_SLOT_SERVICE_LABEL, DOG_SIZE_LABEL } from "@/lib/labels";

const SERVICE_KEYS = ["BAIN_COUPE", "BAIN_SEULEMENT", "COUPE_SEULEMENT", "TOILETTAGE_COMPLET", "AUTRE"];
const SIZE_KEYS = ["TRES_PETIT", "PETIT", "MOYEN", "GRAND", "TRES_GRAND"];

export function SlotFilters({ locale }: { locale: string }) {
  const lang = getLang(locale);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const current = {
    serviceType: searchParams.get("serviceType") ?? "",
    dogSize: searchParams.get("dogSize") ?? "",
    date: searchParams.get("date") ?? "",
  };

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const clear = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  return (
    <div className="flex flex-wrap items-end gap-3 mb-6">
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">
          {lang === "fr" ? "Service" : "Service"}
        </label>
        <Select value={current.serviceType} onValueChange={(v) => update("serviceType", v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={lang === "fr" ? "Tous les services" : "All services"} />
          </SelectTrigger>
          <SelectContent>
            {SERVICE_KEYS.map((k) => (
              <SelectItem key={k} value={k}>
                {getLabel(OPEN_SLOT_SERVICE_LABEL, k, lang)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">
          {lang === "fr" ? "Taille du chien" : "Dog size"}
        </label>
        <Select value={current.dogSize} onValueChange={(v) => update("dogSize", v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={lang === "fr" ? "Toutes tailles" : "All sizes"} />
          </SelectTrigger>
          <SelectContent>
            {SIZE_KEYS.map((k) => (
              <SelectItem key={k} value={k}>
                {getLabel(DOG_SIZE_LABEL, k, lang)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">
          {lang === "fr" ? "Date" : "Date"}
        </label>
        <Input
          type="date"
          value={current.date}
          onChange={(e) => update("date", e.target.value)}
          className="w-[160px]"
        />
      </div>

      {(current.serviceType || current.dogSize || current.date) && (
        <Button variant="ghost" size="sm" onClick={clear}>
          {lang === "fr" ? "Effacer" : "Clear"}
        </Button>
      )}
    </div>
  );
}
