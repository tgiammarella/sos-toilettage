"use client";

import Link from "next/link";
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

  const navLinks = [
    { href: `/${locale}/shifts`, label: t("shifts") },
    { href: `/${locale}/jobs`, label: t("jobs") },
    { href: `/${locale}/schools`, label: t("schools") },
    { href: `/${locale}/partenaires`, label: t("partners") },
    { href: `/${locale}/marketplace`, label: "Marketplace" },
    { href: `/${locale}/pricing`, label: t("pricing") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80" style={{ minHeight: "80px" }}>
      {/* Desktop: three-section layout */}
      <div
        className="hidden md:flex"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "80px",
          padding: "0 24px",
          width: "100%",
        }}
      >
        {/* Left: Logo — fixed 210px, no shrink */}
        <Link
          href={`/${locale}`}
          style={{
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
            width: "210px",
            height: "56px",
            position: "relative",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-wordmark.png"
            alt="ToutToilettage"
            style={{
              width: "210px",
              height: "56px",
              objectFit: "contain",
              objectPosition: "left center",
              display: "block",
              flexShrink: 0,
            }}
          />
        </Link>

        {/* Center: Nav links */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            gap: "32px",
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-[#055864] hover:text-[#055864]/75 hover:underline underline-offset-4 transition-colors whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Language + auth — no shrink */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexShrink: 0,
          }}
        >
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
              <Link
                href={`/${locale}/auth/login`}
                className="inline-flex items-center justify-center rounded-md h-8 px-3 text-sm font-medium text-[#055864] hover:bg-[#055864]/10 transition-colors"
              >
                {t("login")}
              </Link>
              <Button size="sm" asChild>
                <Link href={`/${locale}/auth/register`}>{t("register")}</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile: logo + hamburger */}
      <div className="flex md:hidden items-center justify-between h-16 px-4">
        <Link
          href={`/${locale}`}
          style={{
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
            width: "180px",
            height: "48px",
            position: "relative",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-wordmark.png"
            alt="ToutToilettage"
            style={{
              width: "180px",
              height: "48px",
              objectFit: "contain",
              objectPosition: "left center",
              display: "block",
            }}
          />
        </Link>
        <button
          className="p-2"
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
              className="text-sm font-semibold text-[#055864] py-1"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
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
                <Link
                  href={`/${locale}/auth/login`}
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center rounded-md h-8 px-3 text-sm font-medium text-[#055864] hover:bg-[#055864]/10 transition-colors"
                >
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
