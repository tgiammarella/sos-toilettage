import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { Navbar } from "@/components/nav/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Scissors, Briefcase, GraduationCap, CheckCircle } from "lucide-react";

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

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/20 to-background py-16 md:py-28">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
              <Scissors className="h-4 w-4" />
              SOS Toilettage
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
              {t("hero_title")}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              {t("hero_subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-base px-8">
                <Link href={`/${locale}/auth/register?role=SALON`}>{t("cta_salon")}</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base px-8">
                <Link href={`/${locale}/auth/register?role=GROOMER`}>{t("cta_groomer")}</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border border-border/70 bg-card/90 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-8 pb-6 px-6 text-center">
                  <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 mb-5">
                    <Scissors className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{t("feature_shifts_title")}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {t("feature_shifts_desc")}
                  </p>
                  <Button variant="link" className="mt-4 text-primary p-0 h-auto" asChild>
                    <Link href={`/${locale}/shifts`}>{tNav("shifts")} →</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border border-border/70 bg-card/90 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-8 pb-6 px-6 text-center">
                  <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 mb-5">
                    <Briefcase className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{t("feature_jobs_title")}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {t("feature_jobs_desc")}
                  </p>
                  <Button variant="link" className="mt-4 text-primary p-0 h-auto" asChild>
                    <Link href={`/${locale}/jobs`}>{tNav("jobs")} →</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border border-border/70 bg-card/90 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-8 pb-6 px-6 text-center">
                  <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 mb-5">
                    <GraduationCap className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{t("feature_schools_title")}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {t("feature_schools_desc")}
                  </p>
                  <Button variant="link" className="mt-4 text-primary p-0 h-auto" asChild>
                    <Link href={`/${locale}/schools`}>{tNav("schools")} →</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="py-16 md:py-24 bg-muted/60">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-14">
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
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

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
                className="text-base px-8 border-white text-white hover:bg-white/10"
              >
                <Link href={`/${locale}/auth/register?role=GROOMER`}>{t("cta_groomer")}</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground bg-white">
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} SOS Toilettage. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
