"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Shield, Activity, BookOpen, FileText, Star, Users, Coins, Handshake, GraduationCap, Menu } from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { MobileBottomNav, type MobileNavItem } from "./MobileBottomNav";

interface AdminSidebarProps {
  locale: string;
}

export function AdminSidebar({ locale }: AdminSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations("dashboard.admin");
  const lang = locale === "en" ? "en" : "fr";

  const base = `/${locale}/dashboard/admin`;

  const items = [
    { href: base,                    icon: Shield,   label: t("title"),     exact: true },
    { href: `${base}/ops`,           icon: Activity, label: t("ops") },
    { href: `${base}/schools`,       icon: GraduationCap, label: lang === "fr" ? "Écoles" : "Schools" },
    { href: `${base}/trainings`,     icon: BookOpen, label: lang === "fr" ? "Formations" : "Trainings" },
    { href: `${base}/posts`,         icon: FileText, label: t("posts") },
    { href: `${base}/reviews`,       icon: Star,     label: t("reviews") },
    { href: `${base}/users`,         icon: Users,    label: t("users") },
    { href: `${base}/credits`,       icon: Coins,    label: t("credits") },
    { href: `${base}/partners`,      icon: Handshake, label: "La Vitrine" },
  ];

  // Mobile: 4 primary items for bottom bar
  const primaryItems: MobileNavItem[] = [
    { href: base, icon: Shield, label: t("title"), exact: true },
    { href: `${base}/ops`, icon: Activity, label: t("ops") },
    { href: `${base}/users`, icon: Users, label: t("users") },
    { href: `${base}/posts`, icon: FileText, label: t("posts") },
  ];

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-sidebar border-r border-sidebar-border shrink-0">
        <div className="p-6 border-b border-sidebar-border">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2"
          >
            <img src="/logo-wordmark.png" alt="ToutToilettage" width={180} height={48} style={{ width: '180px', height: '48px', objectFit: 'contain' }} />
          </Link>
          <p className="text-xs text-sidebar-foreground/60 mt-1">Administration</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {items.map(({ href, icon: Icon, label, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <LogoutButton />
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <MobileBottomNav
        primaryItems={primaryItems}
        allItems={items}
        menuIcon={Menu}
        menuLabel="Menu"
      />
    </>
  );
}
