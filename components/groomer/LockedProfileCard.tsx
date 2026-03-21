"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import Link from "next/link";

export function LockedProfileCard({
  firstName,
  locale,
}: {
  firstName: string;
  locale: string;
}) {
  const t = useTranslations("groomerProfile");

  return (
    <Card className="border-2 border-[#E8D2AE] bg-[#FDF8F2] shadow-none">
      <CardContent className="py-6 px-6 space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-[#055864]" />
          <h3 className="text-lg font-semibold text-[#055864]">
            {t("locked_heading")}
          </h3>
        </div>

        <p className="text-sm text-[#1F2933]">
          {t("locked_body", { firstName })}
        </p>

        <ul className="space-y-1.5 text-sm text-[#1F2933]">
          <li>{t("locked_bullet1")}</li>
          <li>{t("locked_bullet2")}</li>
          <li>{t("locked_bullet3")}</li>
        </ul>

        <div className="flex flex-col sm:flex-row items-start gap-3 pt-1">
          <Button
            asChild
            className="bg-[#055864] hover:bg-[#044550] text-white"
          >
            <Link href={`/${locale}/pricing`}>
              {t("locked_cta")}
            </Link>
          </Button>
          <Link
            href={`/${locale}/auth/login`}
            className="text-sm text-[#055864] hover:underline"
          >
            {t("locked_login_link")}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
