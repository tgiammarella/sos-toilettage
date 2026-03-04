"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Scissors, User, FileText, CheckCircle, Star } from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";

interface GroomerSidebarProps {
  locale: string;
  groomerName: string;
}

export function GroomerSidebar({ locale, groomerName }: GroomerSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations("dashboard.groomer");

  const base = `/${locale}/dashboard/groomer`;

  const items = [
    { href: base,                      icon: User,        label: t("my_profile"),      exact: true },
    { href: `${base}/applications`,    icon: FileText,    label: t("my_applications"), exact: false },
    { href: `${base}/confirmed`,       icon: CheckCircle, label: t("confirmed"),        exact: false },
    { href: `${base}/reviews`,         icon: Star,        label: t("reviews"),          exact: false },
  ];

  return (
    <aside className="hidden md:flex w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border shrink-0">
      <div className="p-6 border-b border-sidebar-border/80">
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 text-primary font-bold text-lg"
        >
          <Scissors className="h-5 w-5" />
          SOS Toilettage
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

      <div className="p-4 border-t border-sidebar-border/80">
        <LogoutButton />
      </div>
    </aside>
  );
}
