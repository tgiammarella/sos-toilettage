import { getTranslations } from "next-intl/server";
import { Navbar } from "@/components/nav/Navbar";

export default async function CookiePolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cookies" });

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

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-[#1F2933] mb-3">
                {t("s1_title")}
              </h2>
              <p className="text-[#4a6260] text-sm leading-relaxed">
                {t("s1_body")}
              </p>
            </section>
            <hr className="border-[#CBBBA6] mb-8" />

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-[#1F2933] mb-3">
                {t("s2_title")}
              </h2>
              <p className="text-[#4a6260] text-sm leading-relaxed mb-3">
                {t("s2_body")}
              </p>
              <ul className="list-disc list-inside text-[#4a6260] text-sm leading-relaxed space-y-2">
                <li><strong>{t("s2_auth_label")}</strong> {t("s2_auth")}</li>
                <li><strong>{t("s2_locale_label")}</strong> {t("s2_locale")}</li>
                <li><strong>{t("s2_session_label")}</strong> {t("s2_session")}</li>
              </ul>
            </section>
            <hr className="border-[#CBBBA6] mb-8" />

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-[#1F2933] mb-3">
                {t("s3_title")}
              </h2>
              <p className="text-[#4a6260] text-sm leading-relaxed">
                {t("s3_body")}
              </p>
            </section>
            <hr className="border-[#CBBBA6] mb-8" />

            <section>
              <h2 className="text-xl font-semibold text-[#1F2933] mb-3">
                {t("s4_title")}
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
