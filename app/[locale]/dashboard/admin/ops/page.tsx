export const dynamic = "force-dynamic";

import { requireRole } from "@/lib/auth-guards";
import { getTranslations } from "next-intl/server";
import { getMarketplaceHealth, getFunnelStats, getCreditStats } from "@/lib/admin-stats";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  TrendingUp, Clock, Activity, Layers, AlertTriangle, Coins,
} from "lucide-react";
import { AdminSidebar } from "@/components/dashboard/AdminSidebar";

const PERIODS = [7, 30] as const;
type Period = (typeof PERIODS)[number];

export default async function AdminOpsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ period?: string }>;
}) {
  const { locale } = await params;
  const { period: periodParam } = await searchParams;
  const period: Period = periodParam === "30" ? 30 : 7;

  await requireRole(locale, "ADMIN");
  const t = await getTranslations({ locale, namespace: "dashboard.admin" });

  const [health, funnel, credits] = await Promise.all([
    getMarketplaceHealth(period),
    getFunnelStats(period),
    getCreditStats(period),
  ]);

  const base = `/${locale}/dashboard/admin/ops`;

  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar locale={locale} />

      {/* Main */}
      <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8 overflow-auto">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* Header + period picker */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2 text-[#1F2933]">
                <Activity className="h-6 w-6 text-primary" />
                {t("ops_title")}
              </h1>
            </div>
            <div className="flex gap-2">
              {PERIODS.map((p) => (
                <Link
                  key={p}
                  href={`${base}?period=${p}`}
                  className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    period === p
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:bg-muted"
                  }`}
                >
                  {p === 7 ? t("ops_7d") : t("ops_30d")}
                </Link>
              ))}
            </div>
          </div>

          {/* ── Marketplace Health ─────────────────────── */}
          <section>
            <SectionHeader icon={<TrendingUp className="h-4 w-4 text-primary" />} title={t("health_title")} />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <KpiCard label={t("health_shifts")}   value={health.shiftsPosted} />
              <KpiCard label={t("health_jobs")}     value={health.jobsPosted} />
              <KpiCard label={t("health_apps")}     value={health.applications} />
              <KpiCard label={t("health_fill_rate")} value={`${health.fillRate} %`} />
              <KpiCard label={t("health_median")}   value={health.medianFirstApplicant} />
            </div>
          </section>

          <Separator />

          {/* ── Funnel ────────────────────────────────── */}
          <section>
            <SectionHeader icon={<Layers className="h-4 w-4 text-primary" />} title={t("funnel_title")} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KpiCard label={t("funnel_new_groomers")}    value={funnel.newGroomers} delta />
              <KpiCard label={t("funnel_new_salons")}      value={funnel.newSalons}   delta />
              <KpiCard label={t("funnel_active_groomers")} value={funnel.activatedGroomers} />
              <KpiCard label={t("funnel_active_salons")}   value={funnel.activatedSalons} />
            </div>
          </section>

          <Separator />

          {/* ── Credits ───────────────────────────────── */}
          <section>
            <SectionHeader icon={<Coins className="h-4 w-4 text-primary" />} title={t("credits_title")} />
            <div className="grid md:grid-cols-2 gap-6">
              <KpiCard label={t("credits_consumed")} value={credits.consumed} wide />

              <Card className="border shadow-none">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm text-muted-foreground font-medium">{t("credits_top_salons")}</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  {credits.topSalons.length === 0 ? (
                    <p className="text-sm text-muted-foreground">—</p>
                  ) : (
                    <ul className="space-y-2">
                      {credits.topSalons.map((s, i) => (
                        <li key={s.name} className="flex items-center justify-between text-sm">
                          <span className="text-foreground truncate">
                            <span className="text-muted-foreground mr-2">{i + 1}.</span>
                            {s.name}
                          </span>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {s.credits} cr.
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>

          <Separator />

          {/* ── Moderation ────────────────────────────── */}
          <section>
            <SectionHeader
              icon={<AlertTriangle className="h-4 w-4 text-warning-foreground" />}
              title={t("moderation_title")}
            />
            <Card className="border-dashed shadow-none">
              <CardContent className="py-8 text-center text-muted-foreground text-sm">
                {t("moderation_empty")}
              </CardContent>
            </Card>
          </section>

        </div>
      </main>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {icon}
      <h2 className="text-lg font-semibold">{title}</h2>
    </div>
  );
}

function KpiCard({
  label,
  value,
  delta,
  wide,
}: {
  label: string;
  value: string | number;
  delta?: boolean;
  wide?: boolean;
}) {
  return (
    <Card className={`border shadow-none ${wide ? "md:col-span-1" : ""}`}>
      <CardHeader className="pb-1 pt-4 px-4">
        <p className="text-xs text-muted-foreground font-medium leading-snug">{label}</p>
      </CardHeader>
      <CardContent className="pb-4 px-4">
        <p className="text-2xl font-bold text-foreground">
          {delta && typeof value === "number" && value > 0 ? "+" : ""}
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
