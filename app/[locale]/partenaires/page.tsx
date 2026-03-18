import { getTranslations } from "next-intl/server";
import { Navbar } from "@/components/nav/Navbar";
import { partners } from "@/lib/partners";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default async function PartenairesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "partners" });
  const lang = locale === "en" ? "en" : "fr";

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 max-w-5xl text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-[#1F2933] mb-4">
              {t("title")}
            </h1>
            <p className="text-lg text-[#4a6260] max-w-2xl mx-auto">
              {t("subtitle")}
            </p>
          </div>
        </section>

        {/* Partner cards */}
        <section className="pb-16">
          <div className="container mx-auto px-4 max-w-5xl">
            {partners.length === 0 ? (
              <p className="text-center text-[#4a6260] text-sm">
                {t("no_partners")}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {partners.map((partner) => (
                  <div
                    key={partner.id}
                    className="bg-white border border-[#CBBBA6] rounded-lg p-6 flex flex-col"
                  >
                    <div className="flex items-center justify-center h-16 mb-4">
                      <Image
                        src={partner.logo}
                        alt={partner.name}
                        width={120}
                        height={60}
                        className="max-h-[60px] w-auto object-contain"
                      />
                    </div>
                    <h3 className="text-base font-semibold text-[#1F2933] mb-1">
                      {partner.name}
                    </h3>
                    <p className="text-sm text-[#4a6260] mb-4 flex-1">
                      {lang === "fr" ? partner.taglineFr : partner.taglineEn}
                    </p>
                    {partner.promoCodes && partner.promoCodes.length > 0 && (
                      <div className="mb-4 space-y-2">
                        {partner.promoCodes.map((promo) => (
                          <div
                            key={promo.code}
                            className="rounded-md bg-[#F6EFE6] text-[#055864] px-3 py-2 text-xs"
                          >
                            <span className="font-bold">{promo.code}</span>
                            {" — "}
                            {lang === "fr"
                              ? promo.descriptionFr
                              : promo.descriptionEn}
                          </div>
                        ))}
                      </div>
                    )}
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-[#055864] hover:underline underline-offset-4"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      {t("visit_site")}
                    </a>
                  </div>
                ))}
              </div>
            )}
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
