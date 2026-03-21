"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/nav/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Loader2 } from "lucide-react";

export default function MarketplacePage() {
  const t = useTranslations("marketplace");
  const locale = useLocale();

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function isValidEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!isValidEmail(email)) {
      setError(
        locale === "fr"
          ? "Veuillez entrer un courriel valide."
          : "Please enter a valid email.",
      );
      return;
    }

    setSubmitting(true);
    try {
      await fetch("/api/marketplace/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });
    } catch {
      // Swallow — show success regardless per spec
    } finally {
      setSubmitting(false);
      setSubmitted(true);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="bg-[#055864] py-20 md:py-32">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            {/* Back link */}
            <Link
              href={`/${locale}`}
              className="inline-block text-sm text-[#E8D2AE] hover:underline underline-offset-4 mb-8"
            >
              {t("back_home")}
            </Link>

            {/* Wordmark */}
            <div className="flex justify-center mb-10">
              <Image
                src="/logo-wordmark.png"
                alt="ToutToilettage — Le réseau du toilettage"
                width={320}
                height={120}
                className="w-[220px] md:w-[320px] h-auto"
                priority
              />
            </div>

            <Badge className="bg-[#E8D2AE] text-[#055864] hover:bg-[#E8D2AE]/90 mb-6">
              {t("badge")}
            </Badge>

            <h1
              className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6"
              style={{ fontFamily: "var(--font-cormorant), serif" }}
            >
              {t("headline")}
            </h1>
            <p
              className="text-base md:text-lg text-white/80 mb-10 max-w-xl mx-auto leading-relaxed"
              style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
            >
              {t("subheadline")}
            </p>

            {/* Feature list */}
            <div className="flex flex-col gap-3 max-w-md mx-auto mb-12">
              {(["feature1", "feature2", "feature3"] as const).map((key) => (
                <div
                  key={key}
                  className="rounded-lg bg-[#F6EFE6] px-5 py-3 text-sm text-[#1F2933] text-left"
                  style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
                >
                  {t(key)}
                </div>
              ))}
            </div>

            {/* Email capture */}
            <div className="max-w-sm mx-auto">
              {submitted ? (
                <div className="rounded-lg bg-white/10 border border-white/20 px-5 py-4">
                  <p className="text-[#E8D2AE] font-medium text-sm">
                    {t("notify_success")}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <label
                    className="block text-sm font-medium text-white/90 text-left"
                    style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
                  >
                    {t("notify_label")}
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("notify_placeholder")}
                      className="bg-white border-white/20 focus:border-[#E8D2AE] text-[#1F2933] placeholder:text-[#4a6260]/60"
                      style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
                    />
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="bg-[#E8D2AE] text-[#055864] hover:bg-[#E8D2AE]/90 font-semibold shrink-0"
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          {t("notify_button")}
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </>
                      )}
                    </Button>
                  </div>
                  {error && (
                    <p className="text-xs text-red-300 text-left">{error}</p>
                  )}
                  <p className="text-xs text-white/50 text-left">
                    {t("notify_fine_print")}
                  </p>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
