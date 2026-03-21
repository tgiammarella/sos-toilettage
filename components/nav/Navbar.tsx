"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LocaleToggle } from "./LocaleToggle";
import { Menu, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const roleBasePath =
    session?.user?.role === "SALON"
      ? `/${locale}/dashboard/salon`
      : session?.user?.role === "ADMIN"
        ? `/${locale}/dashboard/admin`
        : `/${locale}/dashboard/groomer`;

  const navLinks: { href: string; label: string; badge?: string }[] = [
    { href: `/${locale}/shifts`, label: t("shifts") },
    { href: `/${locale}/jobs`, label: t("jobs") },
    { href: `/${locale}/schools`, label: t("schools") },
    { href: `/${locale}/partenaires`, label: t("partners") },
    { href: `/${locale}/marketplace`, label: "Marketplace" },
    { href: `/${locale}/pricing`, label: t("pricing") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center shrink-0">
          <Image
            src="/logo-wordmark.png"
            alt="ToutToilettage"
            width={200}
            height={52}
            className="h-[52px] w-auto"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-[#055864] hover:text-[#055864]/75 hover:underline underline-offset-4 transition-colors inline-flex items-center gap-1.5"
            >
              {link.label}
              {link.badge && (
                <span className="inline-flex items-center rounded-full bg-[#E8D2AE] text-[#055864] text-[10px] font-semibold px-1.5 py-0.5 leading-none">
                  {link.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-2">
          <LocaleToggle />
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {session.user?.name ?? session.user?.email}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={roleBasePath}>{t("dashboard")}</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => signOut({ callbackUrl: `/${locale}` })}
                >
                  {t("logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href={`/${locale}/auth/login`} className="inline-flex items-center justify-center rounded-md h-8 px-3 text-sm font-medium text-[#055864] hover:bg-[#055864]/10 transition-colors">
                {t("login")}
              </Link>
              <Button size="sm" asChild>
                <Link href={`/${locale}/auth/register`}>{t("register")}</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/80 bg-background px-4 py-4 flex flex-col gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-[#055864] py-1 inline-flex items-center gap-1.5"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
              {link.badge && (
                <span className="inline-flex items-center rounded-full bg-[#E8D2AE] text-[#055864] text-[10px] font-semibold px-1.5 py-0.5 leading-none">
                  {link.badge}
                </span>
              )}
            </Link>
          ))}
          <div className="flex items-center gap-2 pt-2 border-t">
            <LocaleToggle />
            {session ? (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link href={roleBasePath} onClick={() => setMobileOpen(false)}>
                    {t("dashboard")}
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => signOut({ callbackUrl: `/${locale}` })}
                >
                  {t("logout")}
                </Button>
              </>
            ) : (
              <>
                <Link href={`/${locale}/auth/login`} onClick={() => setMobileOpen(false)} className="inline-flex items-center justify-center rounded-md h-8 px-3 text-sm font-medium text-[#055864] hover:bg-[#055864]/10 transition-colors">
                  {t("login")}
                </Link>
                <Button size="sm" asChild>
                  <Link href={`/${locale}/auth/register`} onClick={() => setMobileOpen(false)}>
                    {t("register")}
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
