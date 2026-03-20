"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { X } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface MobileNavItem {
  href: string;
  icon: LucideIcon;
  label: string;
  exact?: boolean;
}

interface MobileBottomNavProps {
  /** The 4 primary items shown in the bottom bar */
  primaryItems: MobileNavItem[];
  /** All items shown in the expanded drawer */
  allItems: MobileNavItem[];
  /** Optional secondary group (e.g. "Discover" section for groomers) */
  secondaryItems?: MobileNavItem[];
  secondaryLabel?: string;
  /** Menu icon for the 5th "more" slot */
  menuIcon: LucideIcon;
  menuLabel: string;
}

export function MobileBottomNav({
  primaryItems,
  allItems,
  secondaryItems,
  secondaryLabel,
  menuIcon: MenuIcon,
  menuLabel,
}: MobileBottomNavProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <>
      {/* Bottom bar — visible only on mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[#CBBBA6] bg-white pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16">
          {primaryItems.map(({ href, icon: Icon, label, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex flex-col items-center gap-0.5 px-2 py-1 min-w-0 ${
                  active ? "text-[#055864]" : "text-[#4A5568]"
                }`}
              >
                {active && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#055864] rounded-b" />
                )}
                <Icon className="h-5 w-5 shrink-0" />
                <span className="text-[10px] font-medium truncate max-w-[64px]">{label}</span>
              </Link>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex flex-col items-center gap-0.5 px-2 py-1 text-[#4A5568]"
          >
            <MenuIcon className="h-5 w-5 shrink-0" />
            <span className="text-[10px] font-medium">{menuLabel}</span>
          </button>
        </div>
      </nav>

      {/* Drawer overlay */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-[60]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer panel — slides up from bottom */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto pb-[env(safe-area-inset-bottom)] animate-in slide-in-from-bottom duration-200">
            {/* Handle bar */}
            <div className="flex justify-center pt-2 pb-0">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            {/* Header + close */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
              <span className="text-sm font-semibold text-[#1F2933]">{menuLabel}</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1 rounded-md hover:bg-muted"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* All nav items */}
            <div className="p-3 space-y-0.5">
              {allItems.map(({ href, icon: Icon, label, exact }) => {
                const active = isActive(href, exact);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      active
                        ? "bg-primary/10 text-[#055864] font-medium"
                        : "text-[#4A5568] hover:bg-muted"
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" />
                    {label}
                  </Link>
                );
              })}
            </div>

            {/* Secondary group */}
            {secondaryItems && secondaryItems.length > 0 && (
              <div className="px-3 pb-3">
                {secondaryLabel && (
                  <p className="px-3 pt-2 pb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    {secondaryLabel}
                  </p>
                )}
                {secondaryItems.map(({ href, icon: Icon, label }) => {
                  const active = isActive(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setDrawerOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        active
                          ? "bg-primary/10 text-[#055864] font-medium"
                          : "text-[#4A5568] hover:bg-muted"
                      }`}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" />
                      {label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
