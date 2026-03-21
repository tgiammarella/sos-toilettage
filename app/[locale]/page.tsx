import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { Navbar } from "@/components/nav/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Scissors, Briefcase, GraduationCap, CheckCircle, ArrowRight, ArrowDown,
  Clock, Zap, Shield, Star, DollarSign, Smartphone, Award, ShoppingBag, CalendarDays,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getFeaturedPartners } from "@/lib/partners";
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
  const featuredPartners = await getFeaturedPartners();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden bg-[#055864] py-20 md:py-32">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            {/* Logo + tagline */}
            <div className="flex flex-col items-center gap-3 mb-8">
              <Image
                src="/logo.png"
                alt="ToutToilettage"
                width={72}
                height={72}
                className="rounded-full border-2 border-white/20"
              />
              <p className="text-sm font-medium tracking-widest uppercase text-[#E8D2AE]">
                {t("hero_tagline")}
              </p>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6" style={{ fontFamily: "var(--font-cormorant), serif" }}>
              {t("hero_title")}
            </h1>
            <p className="text-lg md:text-xl text-white/85 mb-4 max-w-2xl mx-auto" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
              {t("hero_subtitle")}
            </p>
            <p className="text-base md:text-lg text-[#E8D2AE] italic font-light mb-8 max-w-xl mx-auto">
              {t("hero_connector")}
            </p>

            {/* Trust badges */}
            <div className="flex justify-center gap-6 mb-10 flex-wrap text-sm text-white/70">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-[#E8D2AE]" /> {t("hero_trust1")}
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-[#E8D2AE]" /> {t("hero_trust2")}
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-[#E8D2AE]" /> {t("hero_trust3")}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-[#E8D2AE] text-[#055864] hover:bg-[#E8D2AE]/90 text-base px-8 font-semibold" asChild>
                <Link href={`/${locale}/auth/register?role=SALON`}>
                  {t("cta_salon")} <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10 bg-transparent text-base px-8" asChild>
                <Link href={`/${locale}/auth/register?role=GROOMER`}>
                  {t("cta_groomer")}
                </Link>
              </Button>
              <Button size="lg" variant="ghost" className="text-white/80 hover:text-white hover:bg-white/5 text-base" asChild>
                <a href="#pillars">
                  {t("hero_explore")} <ArrowDown className="h-4 w-4 ml-1" />
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* ── Feature Pillars ── */}
        <section id="pillars" className="py-16 md:py-24 bg-[#F6EFE6]">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Pillar 1: Shifts */}
              <Card className="border border-[#CBBBA6] bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-7 pb-5 px-6 text-center">
                  <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-[#055864]/10 mb-4">
                    <Scissors className="h-7 w-7 text-[#055864]" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-[#1F2933]" style={{ fontFamily: "var(--font-cormorant), serif" }}>
                    🔁 {t("pillar_shifts_title")}
                  </h3>
                  <p className="text-[#4a6260] text-sm leading-relaxed mb-4" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                    {t("pillar_shifts_desc")}
                  </p>
                  <Link href={`/${locale}/shifts`} className="inline-flex items-center text-sm font-medium text-[#055864] hover:underline underline-offset-4">
                    {tNav("shifts")} →
                  </Link>
                </CardContent>
              </Card>

              {/* Pillar 2: Jobs */}
              <Card className="border border-[#CBBBA6] bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-7 pb-5 px-6 text-center">
                  <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-[#055864]/10 mb-4">
                    <Briefcase className="h-7 w-7 text-[#055864]" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-[#1F2933]" style={{ fontFamily: "var(--font-cormorant), serif" }}>
                    💼 {t("pillar_jobs_title")}
                  </h3>
                  <p className="text-[#4a6260] text-sm leading-relaxed mb-4" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                    {t("pillar_jobs_desc")}
                  </p>
                  <Link href={`/${locale}/jobs`} className="inline-flex items-center text-sm font-medium text-[#055864] hover:underline underline-offset-4">
                    {tNav("jobs")} →
                  </Link>
                </CardContent>
              </Card>

              {/* Pillar 3: Training */}
              <Card className="border border-[#CBBBA6] bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-7 pb-5 px-6 text-center">
                  <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-[#055864]/10 mb-4">
                    <GraduationCap className="h-7 w-7 text-[#055864]" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-[#1F2933]" style={{ fontFamily: "var(--font-cormorant), serif" }}>
                    🎓 {t("pillar_training_title")}
                  </h3>
                  <p className="text-[#4a6260] text-sm leading-relaxed mb-4" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                    {t("pillar_training_desc")}
                  </p>
                  <Link href={`/${locale}/schools`} className="inline-flex items-center text-sm font-medium text-[#055864] hover:underline underline-offset-4">
                    {tNav("schools")} →
                  </Link>
                </CardContent>
              </Card>

              {/* Pillar 4: La Vitrine */}
              <Card className="border border-[#CBBBA6] bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-7 pb-5 px-6 text-center">
                  <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-[#055864]/10 mb-4">
                    <ShoppingBag className="h-7 w-7 text-[#055864]" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-[#1F2933]" style={{ fontFamily: "var(--font-cormorant), serif" }}>
                    🏪 {t("pillar_vitrine_title")}
                  </h3>
                  <p className="text-[#4a6260] text-sm leading-relaxed mb-4" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                    {t("pillar_vitrine_desc")}
                  </p>
                  <Link href={`/${locale}/partenaires`} className="inline-flex items-center text-sm font-medium text-[#055864] hover:underline underline-offset-4">
                    {tNav("partners")} →
                  </Link>
                </CardContent>
              </Card>

              {/* Pillar 5: Open Slots — coming soon */}
              <Card className="border border-[#CBBBA6] bg-white shadow-sm hover:shadow-md transition-shadow relative">
                <CardContent className="pt-7 pb-5 px-6 text-center">
                  <Badge className="absolute top-3 right-3 bg-[#3A7F87] text-white text-[10px]">
                    {t("pillar_slots_badge")}
                  </Badge>
                  <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-[#055864]/10 mb-4">
                    <CalendarDays className="h-7 w-7 text-[#055864]" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-[#1F2933]" style={{ fontFamily: "var(--font-cormorant), serif" }}>
                    📅 {t("pillar_slots_title")}
                  </h3>
                  <p className="text-[#4a6260] text-sm leading-relaxed mb-4" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                    {t("pillar_slots_desc")}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="py-16 md:py-20 bg-card">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-14 text-[#1F2933]" style={{ fontFamily: "var(--font-cormorant), serif" }}>
              {t("how_it_works")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
              {[
                { num: "1", icon: Clock, title: t("step1_title"), desc: t("step1_desc") },
                { num: "2", icon: Smartphone, title: t("step2_title"), desc: t("step2_desc") },
                { num: "3", icon: CheckCircle, title: t("step3_title"), desc: t("step3_desc") },
              ].map((step, i) => (
                <div key={step.num} className="relative flex flex-col items-center text-center">
                  <div className="h-14 w-14 rounded-2xl bg-[#055864] flex items-center justify-center text-white font-bold text-xl mb-5">
                    {step.num}
                  </div>
                  <step.icon className="h-6 w-6 text-[#E8D2AE] mb-3" />
                  <h3 className="font-semibold text-lg mb-2 text-[#1F2933]">{step.title}</h3>
                  <p className="text-[#4a6260] text-sm">{step.desc}</p>
                  {i < 2 && (
                    <div className="hidden md:block absolute top-7 -right-5 text-[#CBBBA6]">
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Salon Value Proposition ── */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-12">
              <Badge className="bg-[#055864]/10 text-[#055864] hover:bg-[#055864]/15 mb-4">
                <Scissors className="h-3.5 w-3.5 mr-1" />
                {locale === "fr" ? "Pour les salons" : "For salons"}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1F2933] mb-4" style={{ fontFamily: "var(--font-cormorant), serif" }}>
                {t("salon_section_title")}
              </h2>
              <p className="text-lg text-[#4a6260] max-w-2xl mx-auto">
                {t("salon_section_subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {[
                { icon: Zap, title: t("salon_benefit1_title"), desc: t("salon_benefit1_desc") },
                { icon: Star, title: t("salon_benefit2_title"), desc: t("salon_benefit2_desc") },
                { icon: DollarSign, title: t("salon_benefit3_title"), desc: t("salon_benefit3_desc") },
              ].map(({ icon: Icon, title, desc }) => (
                <Card key={title} className="border border-[#CBBBA6]/50 bg-white shadow-sm">
                  <CardContent className="pt-6 pb-5 px-6">
                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-[#055864]/10 mb-4">
                      <Icon className="h-6 w-6 text-[#055864]" />
                    </div>
                    <h3 className="font-semibold text-base mb-2 text-[#1F2933]">{title}</h3>
                    <p className="text-[#4a6260] text-sm leading-relaxed">{desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button size="lg" className="bg-[#055864] text-white hover:bg-[#055864]/90 font-semibold px-8" asChild>
                <Link href={`/${locale}/auth/register?role=SALON`}>
                  {t("salon_cta")} <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <p className="text-xs text-[#4a6260] mt-2">{t("salon_cta_note")}</p>
            </div>
          </div>
        </section>

        {/* ── Groomer Value Proposition ── */}
        <section className="py-16 md:py-24 bg-[#055864] text-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-12">
              <Badge className="bg-white/15 text-white hover:bg-white/20 mb-4">
                <Award className="h-3.5 w-3.5 mr-1" />
                {locale === "fr" ? "Pour les toiletteurs" : "For groomers"}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-cormorant), serif" }}>
                {t("groomer_section_title")}
              </h2>
              <p className="text-lg text-white/75 max-w-2xl mx-auto">
                {t("groomer_section_subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {[
                { icon: Shield, title: t("groomer_benefit1_title"), desc: t("groomer_benefit1_desc") },
                { icon: Smartphone, title: t("groomer_benefit2_title"), desc: t("groomer_benefit2_desc") },
                { icon: Star, title: t("groomer_benefit3_title"), desc: t("groomer_benefit3_desc") },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="rounded-xl bg-white/10 border border-white/10 p-6">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-white/15 mb-4">
                    <Icon className="h-6 w-6 text-[#E8D2AE]" />
                  </div>
                  <h3 className="font-semibold text-base mb-2">{title}</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Button size="lg" className="bg-[#E8D2AE] text-[#055864] hover:bg-[#E8D2AE]/90 font-semibold px-8" asChild>
                <Link href={`/${locale}/auth/register?role=GROOMER`}>
                  {t("groomer_cta")} <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── Social Proof — Launch Mode ── */}
        <section className="py-12 bg-muted/60">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <Badge className="bg-[#E8D2AE] text-[#055864] hover:bg-[#E8D2AE]/90 mb-4">
              {t("launch_proof_badge")}
            </Badge>
            <h2 className="text-2xl font-bold text-[#1F2933] mb-3" style={{ fontFamily: "var(--font-cormorant), serif" }}>
              {t("launch_proof_title")}
            </h2>
            <p className="text-sm text-[#4a6260]">
              {t("launch_proof_desc")}
            </p>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-2xl font-bold text-center text-[#1F2933] mb-10" style={{ fontFamily: "var(--font-cormorant), serif" }}>
              {t("faq_title")}
            </h2>
            <div className="space-y-4">
              {(["faq_q1", "faq_q2", "faq_q3"] as const).map((qKey) => {
                const aKey = qKey.replace("_q", "_a") as "faq_a1" | "faq_a2" | "faq_a3";
                return (
                  <div key={qKey} className="rounded-xl border border-[#CBBBA6]/50 bg-white p-5 shadow-sm">
                    <p className="font-semibold text-[#1F2933] mb-2">{t(qKey)}</p>
                    <p className="text-sm text-[#4a6260]">{t(aKey)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="py-16 bg-gradient-to-r from-[#055864] to-[#3A7F87]">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8" style={{ fontFamily: "var(--font-cormorant), serif" }}>
              {t("final_cta_title")}
            </h2>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <div className="flex flex-col items-center gap-2">
                <Button size="lg" className="bg-white text-[#055864] hover:bg-white/90 font-semibold text-base px-8" asChild>
                  <Link href={`/${locale}/auth/register?role=SALON`}>
                    {t("final_cta_salon")} <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <p className="text-xs text-white/60">{t("final_cta_salon_note")}</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10 bg-transparent font-semibold text-base px-8" asChild>
                  <Link href={`/${locale}/auth/register?role=GROOMER`}>
                    {t("final_cta_groomer")}
                  </Link>
                </Button>
                <p className="text-xs text-white/60">{t("final_cta_groomer_note")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Partners Strip ── */}
        {featuredPartners.length > 0 && (
          <section className="py-10 bg-[#F6EFE6]">
            <div className="container mx-auto px-4 text-center">
              <p className="text-sm text-[#4a6260] mb-6">{tPartners("trusted_strip")}</p>
              <div className="flex items-center justify-center gap-8 flex-wrap mb-6">
                {featuredPartners.map((p) => (
                  p.logoUrl && (
                    <Image
                      key={p.id}
                      src={p.logoUrl}
                      alt={p.name}
                      width={120}
                      height={40}
                      className="max-w-[120px] max-h-[40px] object-contain grayscale hover:grayscale-0 transition-[filter]"
                    />
                  )
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

      <footer className="border-t py-10 text-sm text-[#4a6260] bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 text-[#1F2933] font-semibold">
              <Image src="/logo.png" alt="ToutToilettage" width={24} height={24} className="rounded-full" />
              ToutToilettage
            </div>
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <Link href={`/${locale}/shifts`} className="hover:underline underline-offset-4">{tNav("shifts")}</Link>
              <Link href={`/${locale}/jobs`} className="hover:underline underline-offset-4">{tNav("jobs")}</Link>
              <Link href={`/${locale}/schools`} className="hover:underline underline-offset-4">{tNav("schools")}</Link>
              <Link href={`/${locale}/partenaires`} className="hover:underline underline-offset-4">{tNav("partners")}</Link>
              <Link href={`/${locale}/pricing`} className="hover:underline underline-offset-4">{tNav("pricing")}</Link>
              <Link href={`/${locale}/contact`} className="hover:underline underline-offset-4">Contact</Link>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t flex flex-col md:flex-row justify-between items-center gap-3 text-xs">
            <div className="flex items-center gap-3">
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
            <p>© {new Date().getFullYear()} ToutToilettage S.E.N.C. {locale === "fr" ? "Tous droits réservés." : "All rights reserved."}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
