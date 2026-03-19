"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";

type PartnerCardProps = {
  partner: {
    id: string;
    name: string;
    taglineFr: string;
    taglineEn: string;
    logoUrl: string | null;
    city: string;
    category: string;
    tier: string;
    featured: boolean;
    memberDiscountPercent: number | null;
    tags: string;
  };
  locale: string;
};

const CATEGORY_LABELS: Record<string, Record<string, string>> = {
  brand: { fr: "Marque", en: "Brand" },
  school: { fr: "École", en: "School" },
  tech: { fr: "Technologie", en: "Tech" },
  industry: { fr: "Industrie", en: "Industry" },
};

export function PartnerCard({ partner, locale }: PartnerCardProps) {
  const lang = locale === "en" ? "en" : "fr";
  const t = useTranslations("partners");
  const tagline = lang === "fr" ? partner.taglineFr : partner.taglineEn;

  const parsedTags: string[] = (() => {
    try {
      const parsed = JSON.parse(partner.tags || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();

  return (
    <Card
      className={`shadow-sm hover:shadow-md transition-shadow bg-white h-full flex flex-col ${
        partner.tier === "SIGNATURE" ? "border-l-4 border-l-[#055864]" : ""
      }`}
    >
      <CardContent className="p-5 flex flex-col h-full">
        {/* Logo + badges */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {partner.logoUrl ? (
              <Image
                src={partner.logoUrl}
                alt={partner.name}
                width={48}
                height={48}
                className="h-12 w-12 rounded-lg object-contain bg-white border border-[#CBBBA6]"
              />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-[#055864] flex items-center justify-center text-white font-bold text-lg">
                {partner.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="font-semibold text-sm text-[#1F2933] leading-tight">
                {partner.name}
              </h3>
              {partner.city && (
                <p className="text-xs text-[#4a6260] flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3" />
                  {partner.city}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {partner.tier === "SIGNATURE" && (
              <Badge className="text-xs bg-[#E8D2AE] text-[#1F2933] border-[#CBBBA6]">
                Signature ★
              </Badge>
            )}
            {partner.tier === "VEDETTE" && (
              <Badge className="text-xs bg-[#055864] text-white">
                Vedette
              </Badge>
            )}
          </div>
        </div>

        {/* Category */}
        <Badge variant="outline" className="text-xs w-fit mb-2">
          {CATEGORY_LABELS[partner.category]?.[lang] ?? partner.category}
        </Badge>

        {/* Tagline */}
        {tagline && (
          <p className="text-sm text-[#4a6260] line-clamp-2 mb-3 flex-1">
            {tagline}
          </p>
        )}

        {/* Discount badge */}
        {partner.tier === "DECOUVERTE" && partner.memberDiscountPercent && (
          <div className="mb-3">
            <Badge className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
              {partner.memberDiscountPercent}% {t("member_discount")}
            </Badge>
          </div>
        )}

        {/* Tags */}
        {parsedTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {parsedTags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-[#4a6260]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-auto border-[#055864] text-[#055864] hover:bg-[#055864]/5"
          asChild
        >
          <Link href={`/${locale}/partenaires/${partner.id}`}>
            {t("view_profile")}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
