"use client";

import { signOut } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const locale = useLocale();
  const t = useTranslations("nav");

  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-full justify-start gap-3 px-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
      onClick={() => signOut({ callbackUrl: `/${locale}` })}
    >
      <LogOut className="h-4 w-4 shrink-0" />
      {t("logout")}
    </Button>
  );
}
