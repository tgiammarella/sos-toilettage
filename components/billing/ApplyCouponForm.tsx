"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Tag } from "lucide-react";

export function ApplyCouponForm() {
  const t = useTranslations("dashboard.salon");
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/billing/apply-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        const errMap: Record<string, string> = {
          INVALID_CODE:    t("billing_coupon_invalid"),
          EXPIRED:         t("billing_coupon_invalid"),
          MAX_USES_REACHED:t("billing_coupon_invalid"),
          ALREADY_USED:    t("billing_coupon_used"),
        };
        toast.error(errMap[data.error] ?? t("billing_coupon_invalid"));
      } else {
        toast.success(t("billing_coupon_success"));
        setCode("");
        router.refresh();
      }
    } catch {
      toast.error(t("billing_coupon_invalid"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleApply} className="flex gap-2">
      <div className="relative flex-1">
        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder={t("billing_coupon_placeholder")}
          className="pl-9 uppercase tracking-widest font-mono text-sm"
          disabled={loading}
          maxLength={32}
        />
      </div>
      <Button type="submit" disabled={loading || !code.trim()} size="sm">
        {t("billing_coupon_apply")}
      </Button>
    </form>
  );
}
