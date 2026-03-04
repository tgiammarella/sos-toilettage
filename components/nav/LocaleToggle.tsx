"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

const LOCALES = ["fr", "en"] as const;

export function LocaleToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const segments = pathname.split("/");
  const currentLocale = segments[1]; // "fr" or "en"

  function switchTo(locale: string) {
    if (locale === currentLocale) return;
    const next = [...segments];
    next[1] = locale;
    const qs = searchParams.toString();
    router.push(next.join("/") + (qs ? `?${qs}` : ""));
  }

  return (
    <div className="flex items-center gap-0.5">
      {LOCALES.map((loc) => (
        <Button
          key={loc}
          variant={loc === currentLocale ? "secondary" : "ghost"}
          size="sm"
          onClick={() => switchTo(loc)}
          className="text-xs font-semibold px-2.5 uppercase"
        >
          {loc}
        </Button>
      ))}
    </div>
  );
}
