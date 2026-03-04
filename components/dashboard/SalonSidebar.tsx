"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  Scissors,
  Briefcase,
  Users,
  CheckCircle,
  CreditCard,
  Settings,
} from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";

interface SalonSidebarProps {
  locale: string;
  salonName: string;
}

export function SalonSidebar({ locale, salonName }: SalonSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations("dashboard.salon");

  const base = `/${locale}/dashboard/salon`;

  const items = [
    { href: `${base}/shifts`,     icon: Scissors,    label: t("my_shifts") },
    { href: `${base}/jobs`,       icon: Briefcase,   label: t("my_jobs") },
    { href: `${base}/applicants`, icon: Users,       label: t("applicants") },
    { href: `${base}/confirmed`,  icon: CheckCircle, label: t("confirmed") },
    { href: `${base}/billing`,    icon: CreditCard,  label: t("billing") },
    { href: `${base}/settings`,   icon: Settings,    label: t("settings") },
  ];

  return (
    <aside className="hidden md:flex w-64 flex-col bg-white border-r shrink-0">
      <div className="p-6 border-b">
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 text-primary font-bold text-lg"
        >
          <Scissors className="h-5 w-5" />
          SOS Toilettage
        </Link>
        <p className="text-xs text-muted-foreground mt-1 truncate">{salonName}</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {items.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <LogoutButton />
      </div>
    </aside>
  );
}
