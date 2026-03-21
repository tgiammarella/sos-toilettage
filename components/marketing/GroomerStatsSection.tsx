import { getTranslations } from "next-intl/server";
import { getMarketStats } from "@/lib/market-stats";
import { Check, Users, TrendingUp, Clock } from "lucide-react";

export async function GroomerStatsSection({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "home" });
  const stats = await getMarketStats();

  return (
    <section className="py-16 md:py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 max-w-5xl">

        {/* Headline */}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            {t("groomers_section_title")}
          </h2>
          <p className="text-lg text-primary-foreground/75">
            {t("groomers_section_subtitle")}
          </p>
        </div>

        {/* Bullets + Stats side by side on desktop */}
        <div className="grid md:grid-cols-2 gap-10 items-center">

          {/* Bullets */}
          <ul className="space-y-4">
            {(["groomers_bullet1", "groomers_bullet2", "groomers_bullet3"] as const).map((key) => (
              <li key={key} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent">
                  <Check className="h-3 w-3 text-accent-foreground" />
                </span>
                <span className="text-primary-foreground/90 text-base">{t(key)}</span>
              </li>
            ))}
          </ul>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard
              icon={<Users className="h-5 w-5 text-accent" />}
              value={stats.totalGroomers.toLocaleString("fr-CA")}
              label={t("stat_groomers_label")}
            />
            <StatCard
              icon={<TrendingUp className="h-5 w-5 text-accent" />}
              value={`+${stats.newGroomersThisWeek}`}
              label={t("stat_new_week_label")}
            />
            <StatCard
              icon={<Clock className="h-5 w-5 text-accent" />}
              value={stats.avgTimeToFirstApplicant}
              label={t("stat_avg_response_label")}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center text-center p-4 rounded-xl bg-white/10 border border-primary-foreground/10">
      <div className="mb-2">{icon}</div>
      <p className="text-2xl font-bold text-primary-foreground tabular-nums">{value}</p>
      <p className="text-xs text-primary-foreground/60 mt-1 leading-tight">{label}</p>
    </div>
  );
}
