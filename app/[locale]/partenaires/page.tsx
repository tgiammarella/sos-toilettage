export const dynamic = "force-dynamic";

import { getTranslations } from "next-intl/server";
import { Navbar } from "@/components/nav/Navbar";
import { getPartners } from "@/lib/partners";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PartnerDirectory } from "@/components/partners/PartnerDirectory";

export default async function PartenairesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "partners" });
  const partners = await getPartners();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 max-w-5xl text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-[#1F2933] mb-4">
              {t("directory_title")}
            </h1>
            <p className="text-lg text-[#4a6260] max-w-2xl mx-auto mb-6">
              {t("directory_subtitle")}
            </p>
            <Button variant="outline" asChild className="border-[1.5px] border-[#055864] text-[#055864] bg-transparent hover:bg-[#055864]/5">
              <a href="mailto:info@touttoilettage.com">{t("become_partner")}</a>
            </Button>
          </div>
        </section>

        {/* Directory with client-side filtering */}
        <section className="pb-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <PartnerDirectory partners={partners} locale={locale} />
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-[#F6EFE6]">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-[#1F2933] mb-4">
              {t("cta_title")}
            </h2>
            <p className="text-[#4a6260] mb-6 text-sm">
              {t("cta_subtitle")}
            </p>
            <Button variant="outline" asChild className="border-[1.5px] border-[#055864] text-[#055864] bg-transparent hover:bg-[#055864]/5">
              <Link href={`/${locale}/contact`}>{t("cta_button")}</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
