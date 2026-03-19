"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Scissors, Home, User, FileText, CheckCircle, Star, Briefcase, BookOpen } from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";

interface GroomerSidebarProps {
  locale: string;
  groomerName: string;
}

export function GroomerSidebar({ locale, groomerName }: GroomerSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations("dashboard.groomer");

  const tNav = useTranslations("nav");

  const base = `/${locale}/dashboard/groomer`;

  const items = [
    { href: base,                      icon: Home,        label: t("dashboard"),       exact: true },
    { href: `${base}/profile`,         icon: User,        label: t("my_profile"),      exact: false },
    { href: `${base}/applications`,    icon: FileText,    label: t("my_applications"), exact: false },
    { href: `${base}/confirmed`,       icon: CheckCircle, label: t("confirmed"),        exact: false },
    { href: `${base}/reviews`,         icon: Star,        label: t("reviews"),          exact: false },
  ];

  const discoverItems = [
    { href: `/${locale}/shifts`,   icon: Scissors,  label: tNav("shifts") },
    { href: `/${locale}/jobs`,     icon: Briefcase, label: tNav("jobs") },
    { href: `/${locale}/schools`,  icon: BookOpen,  label: tNav("schools") },
  ];

  return (
    <aside className="hidden md:flex w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border shrink-0">
      <div className="p-6 border-b border-sidebar-border/80">
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 text-sidebar-foreground font-bold text-lg"
        >
          <Scissors className="h-5 w-5" />
          Tout Toilettage
        </Link>
        <p className="text-xs text-muted-foreground mt-1 truncate">{groomerName}</p>
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
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/80 hover:text-sidebar-primary hover:bg-sidebar-primary/10"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 pt-3">
        <p className="px-3 text-[11px] font-medium uppercase tracking-wider text-sidebar-foreground/50 mb-1">
          {tNav("discover")}
        </p>
        {discoverItems.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/80 hover:text-sidebar-primary hover:bg-sidebar-primary/10"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-sidebar-border/80">
        <LogoutButton />
      </div>
    </aside>
  );
}
