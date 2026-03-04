"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LocaleToggle } from "./LocaleToggle";
import { Menu, X, Scissors } from "lucide-react";
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
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2 font-bold text-xl text-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Scissors className="h-4 w-4" />
          </div>
          <span className="tracking-tight">SOS Toilettage</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-colors"
            >
              {link.label}
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
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/${locale}/auth/login`}>{t("login")}</Link>
              </Button>
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
              className="text-sm font-medium py-1"
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
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/${locale}/auth/login`} onClick={() => setMobileOpen(false)}>
                    {t("login")}
                  </Link>
                </Button>
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
