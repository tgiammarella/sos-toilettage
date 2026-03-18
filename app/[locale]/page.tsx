import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { Navbar } from "@/components/nav/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Scissors, Briefcase, GraduationCap, CheckCircle } from "lucide-react";
import { GroomerStatsSection } from "@/components/marketing/GroomerStatsSection";
import { partners } from "@/lib/partners";
import Image from "next/image";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const session = await auth();
  if (session?.user?.role) {
    const role = session.user.role;
    if (role === "SALON")   redirect(`/${locale}/dashboard/salon`);
    if (role === "GROOMER") redirect(`/${locale}/dashboard/groomer`);
    if (role === "ADMIN")   redirect(`/${locale}/dashboard/admin`);
  }

  const t = await getTranslations("home");
  const tNav = await getTranslations("nav");
  const tPartners = await getTranslations("partners");

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden bg-primary py-16 md:py-28">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/15 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
              <Scissors className="h-4 w-4" />
              Tout Toilettage
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6 [&]:text-white">
              {t("hero_title")}
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              {t("hero_subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/${locale}/auth/register?role=GROOMER`} className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-base font-medium h-10 px-8 shadow-sm bg-[#E8D2AE] text-[#055864] border-0 hover:opacity-90 transition-opacity" style={{ backgroundColor: '#E8D2AE', color: '#055864', border: 'none' }}>
                {t("cta_groomer")}
              </Link>
              <Link href={`/${locale}/auth/register?role=SALON`} className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-base font-medium h-10 px-8 shadow-sm bg-[#E8D2AE] text-[#055864] border-0 hover:opacity-90 transition-opacity" style={{ backgroundColor: '#E8D2AE', color: '#055864', border: 'none' }}>
                {t("cta_salon")}
              </Link>
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border border-border/70 bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-8 pb-6 px-6 text-center">
                  <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 mb-5">
                    <Scissors className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-[#1F2933]">{t("feature_shifts_title")}</h3>
                  <p className="text-[#4a6260] text-sm leading-relaxed">
                    {t("feature_shifts_desc")}
                  </p>
                  <Link href={`/${locale}/shifts`} className="mt-4 inline-flex items-center text-sm font-medium text-[#055864] hover:underline underline-offset-4 p-0">
                    {tNav("shifts")} →
                  </Link>
                </CardContent>
              </Card>

              <Card className="border border-border/70 bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-8 pb-6 px-6 text-center">
                  <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 mb-5">
                    <Briefcase className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-[#1F2933]">{t("feature_jobs_title")}</h3>
                  <p className="text-[#4a6260] text-sm leading-relaxed">
                    {t("feature_jobs_desc")}
                  </p>
                  <Link href={`/${locale}/jobs`} className="mt-4 inline-flex items-center text-sm font-medium text-[#055864] hover:underline underline-offset-4 p-0">
                    {tNav("jobs")} →
                  </Link>
                </CardContent>
              </Card>

              <Card className="border border-border/70 bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-8 pb-6 px-6 text-center">
                  <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 mb-5">
                    <GraduationCap className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-[#1F2933]">{t("feature_schools_title")}</h3>
                  <p className="text-[#4a6260] text-sm leading-relaxed">
                    {t("feature_schools_desc")}
                  </p>
                  <Link href={`/${locale}/schools`} className="mt-4 inline-flex items-center text-sm font-medium text-[#055864] hover:underline underline-offset-4 p-0">
                    {tNav("schools")} →
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="py-16 md:py-24 bg-muted/60">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-14 text-[#1F2933]">
              {t("how_it_works")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { num: "1", title: t("step1_title"), desc: t("step1_desc") },
                { num: "2", title: t("step2_title"), desc: t("step2_desc") },
                { num: "3", title: t("step3_title"), desc: t("step3_desc") },
              ].map((step) => (
                <div key={step.num} className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl mb-5">
                    {step.num}
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-[#1F2933]">{step.title}</h3>
                  <p className="text-[#4a6260] text-sm">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Groomer Stats ── */}
        <GroomerStatsSection locale={locale} />

        {/* ── CTA Banner ── */}
        <section className="py-16 bg-gradient-to-r from-primary to-accent">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-4 text-white/80">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">{t("trusted_by")}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
              {t("hero_title")}
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="text-base px-8 bg-white text-primary hover:bg-white/90"
              >
                <Link href={`/${locale}/auth/register?role=SALON`}>{t("cta_salon")}</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="text-base px-8 border-[1.5px] border-white/80 text-white hover:bg-white/10 bg-transparent"
              >
                <Link href={`/${locale}/auth/register?role=GROOMER`}>{t("cta_groomer")}</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── Partners Strip ── */}
        {partners.filter((p) => p.featured).length > 0 && (
          <section className="py-10 bg-[#F6EFE6]">
            <div className="container mx-auto px-4 text-center">
              <p className="text-sm text-[#4a6260] mb-6">{tPartners("trusted_strip")}</p>
              <div className="flex items-center justify-center gap-8 flex-wrap mb-6">
                {partners
                  .filter((p) => p.featured)
                  .map((p) => (
                    <Image
                      key={p.id}
                      src={p.logo}
                      alt={p.name}
                      width={120}
                      height={40}
                      className="max-w-[120px] max-h-[40px] object-contain grayscale hover:grayscale-0 transition-all"
                    />
                  ))}
              </div>
              <Link
                href={`/${locale}/partenaires`}
                className="text-sm font-medium text-[#055864] hover:underline underline-offset-4"
              >
                {tPartners("see_all")} →
              </Link>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t py-8 text-sm text-[#4a6260] bg-white">
        <div className="container mx-auto px-4 flex flex-col items-center gap-3">
          <div className="flex items-center gap-4">
            <Link href={`/${locale}/contact`} className="hover:underline underline-offset-4">
              Contact
            </Link>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#4a6260]">
            <Link href={`/${locale}/politique-confidentialite`} className="hover:underline underline-offset-4">
              {locale === "fr" ? "Politique de confidentialité" : "Privacy Policy"}
            </Link>
            <span>·</span>
            <Link href={`/${locale}/conditions-utilisation`} className="hover:underline underline-offset-4">
              {locale === "fr" ? "Conditions d'utilisation" : "Terms of Service"}
            </Link>
            <span>·</span>
            <Link href={`/${locale}/cookies`} className="hover:underline underline-offset-4">
              Cookies
            </Link>
          </div>
          <p className="text-xs">© {new Date().getFullYear()} ToutToilettage S.E.N.C. {locale === "fr" ? "Tous droits réservés." : "All rights reserved."}</p>
        </div>
      </footer>
    </div>
  );
}
