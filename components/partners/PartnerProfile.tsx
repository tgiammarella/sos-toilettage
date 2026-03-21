"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { PartnerBadge } from "@/components/ui/PartnerBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  Phone,
  Copy,
  Check,
  Lock,
  X,
} from "lucide-react";
import type { Partner } from "@/lib/partners";

const CATEGORY_LABELS: Record<string, Record<string, string>> = {
  brand: { fr: "Marque", en: "Brand" },
  school: { fr: "École", en: "School" },
  tech: { fr: "Technologie", en: "Tech" },
  industry: { fr: "Industrie", en: "Industry" },
};

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385h-3.047v-3.47h3.047v-2.642c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.513c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385c5.737-.9 10.125-5.864 10.125-11.854z" />
    </svg>
  );
}

function TiktokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

export function PartnerProfile({
  partner,
  locale,
  showPromoCta = false,
}: {
  partner: Partner;
  locale: string;
  showPromoCta?: boolean;
}) {
  const lang = locale === "en" ? "en" : "fr";
  const t = useTranslations("partners");
  const [copied, setCopied] = useState(false);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const description = lang === "fr" ? partner.descriptionFr : partner.descriptionEn;
  const tagline = lang === "fr" ? partner.taglineFr : partner.taglineEn;
  const promoDesc = lang === "fr" ? partner.promoDescFr : partner.promoDescEn;

  const photos: string[] = (() => {
    try { const p = JSON.parse(partner.photos || "[]"); return Array.isArray(p) ? p : []; }
    catch { return []; }
  })();

  const tags: string[] = (() => {
    try { const p = JSON.parse(partner.tags || "[]"); return Array.isArray(p) ? p : []; }
    catch { return []; }
  })();

  const isVedette = partner.tier === "VEDETTE" || partner.tier === "SIGNATURE";
  const isSignature = partner.tier === "SIGNATURE";

  const maxPhotos = isSignature ? 10 : isVedette ? 5 : 0;
  const visiblePhotos = photos.slice(0, maxPhotos);

  function copyCode() {
    if (partner.promoCode) {
      navigator.clipboard.writeText(partner.promoCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const hasSocial = partner.instagramUrl || partner.facebookUrl || partner.tiktokUrl;

  // --- Sidebar content (reused for desktop sidebar + mobile CTA) ---
  const sidebarContent = (
    <div className="space-y-4">
      {/* Logo */}
      <div className="flex justify-center">
        {partner.logoUrl ? (
          <Image src={partner.logoUrl} alt={partner.name} width={120} height={120} className="rounded-xl object-contain" />
        ) : (
          <div className="h-20 w-20 rounded-xl bg-[#055864] flex items-center justify-center text-white font-bold text-3xl">
            {partner.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Contact buttons */}
      {partner.website && (
        <Button className="w-full bg-[#055864] hover:bg-[#055864]/90" asChild>
          <a href={partner.website} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            {t("visit_site")}
          </a>
        </Button>
      )}
      {isVedette && partner.phone && (
        <Button variant="outline" className="w-full border-[#055864] text-[#055864]" asChild>
          <a href={`tel:${partner.phone}`}>
            <Phone className="h-4 w-4 mr-2" />
            {partner.phone}
          </a>
        </Button>
      )}

      {/* Social */}
      {isVedette && hasSocial && (
        <div className="flex justify-center gap-3">
          {partner.instagramUrl && (
            <a href={partner.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-[#4a6260] hover:text-[#055864] transition-colors">
              <InstagramIcon className="h-5 w-5" />
            </a>
          )}
          {partner.facebookUrl && (
            <a href={partner.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-[#4a6260] hover:text-[#055864] transition-colors">
              <FacebookIcon className="h-5 w-5" />
            </a>
          )}
          {partner.tiktokUrl && (
            <a href={partner.tiktokUrl} target="_blank" rel="noopener noreferrer" className="text-[#4a6260] hover:text-[#055864] transition-colors">
              <TiktokIcon className="h-5 w-5" />
            </a>
          )}
        </div>
      )}

      {/* Discount */}
      {partner.memberDiscountPercent && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="py-3 px-4 text-center">
            <p className="text-sm font-semibold text-emerald-700">
              {partner.memberDiscountPercent}% {t("member_discount")}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <main className="flex-1">
      {/* Banner (Signature only) */}
      {isSignature && (
        <div className="relative h-48 md:h-64 w-full overflow-hidden">
          {partner.bannerImageUrl ? (
            <Image
              src={partner.bannerImageUrl}
              alt=""
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#055864] to-[#055864]/70 flex items-center justify-center">
              {partner.logoUrl ? (
                <Image src={partner.logoUrl} alt={partner.name} width={100} height={100} className="object-contain opacity-80" />
              ) : (
                <span className="text-white/40 text-6xl font-bold">{partner.name.charAt(0)}</span>
              )}
            </div>
          )}
        </div>
      )}

      <div className="container mx-auto px-4 max-w-5xl py-8">
        {/* Breadcrumb */}
        <Link
          href={`/${locale}/partenaires`}
          className="inline-flex items-center gap-1 text-sm text-[#055864] hover:underline underline-offset-4 mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("back_to_directory")}
        </Link>

        <div className={`${isSignature ? "flex flex-col md:flex-row gap-8" : ""}`}>
          {/* Main content */}
          <div className="flex-1 space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4">
              {!isSignature && (
                partner.logoUrl ? (
                  <Image src={partner.logoUrl} alt={partner.name} width={64} height={64} className="rounded-xl object-contain border border-[#CBBBA6] bg-white" />
                ) : (
                  <div className="h-16 w-16 rounded-xl bg-[#055864] flex items-center justify-center text-white font-bold text-2xl shrink-0">
                    {partner.name.charAt(0).toUpperCase()}
                  </div>
                )
              )}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-[#1F2933]">{partner.name}</h1>
                  <PartnerBadge tier={partner.tier} size="lg" />
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {CATEGORY_LABELS[partner.category]?.[lang] ?? partner.category}
                  </Badge>
                  {partner.city && (
                    <span className="text-sm text-[#4a6260] flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {partner.city}{partner.province ? `, ${partner.province}` : ""}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {(description || tagline) && (
              <div>
                <p className="text-[#4a6260] leading-relaxed">
                  {description || tagline}
                </p>
              </div>
            )}

            {/* Tags (Vedette+) */}
            {isVedette && tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                ))}
              </div>
            )}

            {/* Discount callout */}
            {partner.memberDiscountPercent && !isSignature && (
              <Card className="border-emerald-200 bg-emerald-50">
                <CardContent className="py-4 px-5">
                  <p className="text-sm text-emerald-700">
                    {t("discount_callout", { percent: partner.memberDiscountPercent })}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Promo code */}
            {partner.promoCode && (
              <Card className="border-[#CBBBA6] bg-[#F6EFE6]">
                <CardContent className="py-4 px-5">
                  <p className="text-xs text-[#4a6260] mb-2">{t("promo_label")}</p>
                  <div className="flex items-center gap-2">
                    <code className="bg-white px-3 py-1.5 rounded border border-[#CBBBA6] text-sm font-mono font-bold text-[#055864]">
                      {partner.promoCode}
                    </code>
                    <Button variant="ghost" size="sm" onClick={copyCode}>
                      {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  {promoDesc && (
                    <p className="text-xs text-[#4a6260] mt-2">{promoDesc}</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Login CTA for promo code (anonymous users) */}
            {showPromoCta && !partner.promoCode && (
              <Card className="border-[#CBBBA6] bg-[#F6EFE6]">
                <CardContent className="py-4 px-5">
                  <p className="text-xs text-[#4a6260] mb-2">{t("promo_label")}</p>
                  <Link
                    href={`/${locale}/auth/login`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[#055864] hover:underline underline-offset-4"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    {t("promo_login_cta")}
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Photo gallery (Vedette+) */}
            {isVedette && visiblePhotos.length > 0 && (
              <div>
                <Separator className="mb-4" />
                <h2 className="text-lg font-semibold text-[#1F2933] mb-3">{t("photos")}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {visiblePhotos.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setLightboxImg(url)}
                      className="relative aspect-[4/3] rounded-lg overflow-hidden border border-[#CBBBA6] hover:opacity-90 transition-opacity"
                    >
                      <Image src={url} alt="" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Non-signature: website + phone + social inline */}
            {!isSignature && (
              <div className="flex flex-wrap gap-3 pt-2">
                {partner.website && (
                  <Button className="bg-[#055864] hover:bg-[#055864]/90" asChild>
                    <a href={partner.website} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {t("visit_site")}
                    </a>
                  </Button>
                )}
                {isVedette && partner.phone && (
                  <Button variant="outline" className="border-[#055864] text-[#055864]" asChild>
                    <a href={`tel:${partner.phone}`}>
                      <Phone className="h-4 w-4 mr-2" />
                      {partner.phone}
                    </a>
                  </Button>
                )}
              </div>
            )}

            {/* Social links inline (Vedette, not Signature — Signature has sidebar) */}
            {partner.tier === "VEDETTE" && hasSocial && (
              <div className="flex gap-4 pt-2">
                {partner.instagramUrl && (
                  <a href={partner.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-[#4a6260] hover:text-[#055864]">
                    <InstagramIcon className="h-5 w-5" />
                  </a>
                )}
                {partner.facebookUrl && (
                  <a href={partner.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-[#4a6260] hover:text-[#055864]">
                    <FacebookIcon className="h-5 w-5" />
                  </a>
                )}
                {partner.tiktokUrl && (
                  <a href={partner.tiktokUrl} target="_blank" rel="noopener noreferrer" className="text-[#4a6260] hover:text-[#055864]">
                    <TiktokIcon className="h-5 w-5" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Sticky sidebar (Signature only, desktop) */}
          {isSignature && (
            <aside className="hidden md:block w-72 shrink-0">
              <div className="sticky top-24">
                {sidebarContent}
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Mobile bottom CTA bar (Signature only) */}
      {isSignature && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#CBBBA6] p-3 flex gap-2 z-20">
          {partner.website && (
            <Button className="flex-1 bg-[#055864] hover:bg-[#055864]/90" asChild>
              <a href={partner.website} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" />
                {t("visit_site")}
              </a>
            </Button>
          )}
          {partner.phone && (
            <Button variant="outline" className="border-[#055864] text-[#055864]" asChild>
              <a href={`tel:${partner.phone}`}>
                <Phone className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      )}

      {/* Lightbox */}
      {lightboxImg && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxImg(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-white/70"
            onClick={() => setLightboxImg(null)}
          >
            <X className="h-6 w-6" />
          </button>
          <div className="relative max-w-4xl max-h-[85vh] w-full" onClick={(e) => e.stopPropagation()}>
            <Image
              src={lightboxImg}
              alt=""
              width={1200}
              height={800}
              className="object-contain w-full h-full rounded-lg"
            />
          </div>
        </div>
      )}
    </main>
  );
}
