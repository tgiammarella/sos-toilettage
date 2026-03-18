import { getTranslations } from "next-intl/server";
import { Navbar } from "@/components/nav/Navbar";

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "terms" });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-white border border-[#CBBBA6] rounded-lg p-8 md:p-12">
            <h1 className="text-3xl font-bold text-[#1F2933] mb-2">
              {t("title")}
            </h1>
            <p className="text-sm text-[#4a6260] mb-10">
              {t("last_updated")}
            </p>

            {/* 1. Acceptation */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-[#1F2933] mb-3">
                {t("s1_title")}
              </h2>
              <p className="text-[#4a6260] text-sm leading-relaxed">
                {t("s1_body")}
              </p>
            </section>
            <hr className="border-[#CBBBA6] mb-8" />

            {/* 2. Description du service */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-[#1F2933] mb-3">
                {t("s2_title")}
              </h2>
              <p className="text-[#4a6260] text-sm leading-relaxed">
                {t("s2_body")}
              </p>
            </section>
            <hr className="border-[#CBBBA6] mb-8" />

            {/* 3. Comptes utilisateurs */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-[#1F2933] mb-3">
                {t("s3_title")}
              </h2>
              <ul className="list-disc list-inside text-[#4a6260] text-sm leading-relaxed space-y-2">
                <li>{t("s3_item1")}</li>
                <li>{t("s3_item2")}</li>
                <li>{t("s3_item3")}</li>
              </ul>
            </section>
            <hr className="border-[#CBBBA6] mb-8" />

            {/* 4. Règles d'utilisation */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-[#1F2933] mb-3">
                {t("s4_title")}
              </h2>
              <ul className="list-disc list-inside text-[#4a6260] text-sm leading-relaxed space-y-2">
                <li>{t("s4_item1")}</li>
                <li>{t("s4_item2")}</li>
                <li>{t("s4_item3")}</li>
              </ul>
            </section>
            <hr className="border-[#CBBBA6] mb-8" />

            {/* 5. Crédits et paiements */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-[#1F2933] mb-3">
                {t("s5_title")}
              </h2>
              <ul className="list-disc list-inside text-[#4a6260] text-sm leading-relaxed space-y-2">
                <li>{t("s5_item1")}</li>
                <li>{t("s5_item2")}</li>
                <li>{t("s5_item3")}</li>
              </ul>
            </section>
            <hr className="border-[#CBBBA6] mb-8" />

            {/* 6. Annulations et remboursements */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-[#1F2933] mb-3">
                {t("s6_title")}
              </h2>
              <ul className="list-disc list-inside text-[#4a6260] text-sm leading-relaxed space-y-2">
                <li>{t("s6_item1")}</li>
                <li>{t("s6_item2")}</li>
              </ul>
            </section>
            <hr className="border-[#CBBBA6] mb-8" />

            {/* 7. Limitation de responsabilité */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-[#1F2933] mb-3">
                {t("s7_title")}
              </h2>
              <p className="text-[#4a6260] text-sm leading-relaxed">
                {t("s7_body")}
              </p>
            </section>
            <hr className="border-[#CBBBA6] mb-8" />

            {/* 8. Propriété intellectuelle */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-[#1F2933] mb-3">
                {t("s8_title")}
              </h2>
              <p className="text-[#4a6260] text-sm leading-relaxed">
                {t("s8_body")}
              </p>
            </section>
            <hr className="border-[#CBBBA6] mb-8" />

            {/* 9. Droit applicable */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-[#1F2933] mb-3">
                {t("s9_title")}
              </h2>
              <p className="text-[#4a6260] text-sm leading-relaxed">
                {t("s9_body")}
              </p>
            </section>
            <hr className="border-[#CBBBA6] mb-8" />

            {/* 10. Contact */}
            <section>
              <h2 className="text-xl font-semibold text-[#1F2933] mb-3">
                {t("s10_title")}
              </h2>
              <p className="text-[#4a6260] text-sm leading-relaxed">
                <a
                  href="mailto:info@touttoilettage.com"
                  className="text-[#055864] hover:underline underline-offset-4"
                >
                  info@touttoilettage.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
