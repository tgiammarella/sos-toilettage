"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, Send, CheckCircle2 } from "lucide-react";

export function QuickApplyButton({
  shiftId,
  alreadyApplied,
}: {
  shiftId: string;
  alreadyApplied: boolean;
  locale: string;
}) {
  const t = useTranslations("ui");
  const [applied, setApplied] = useState(alreadyApplied);
  const [loading, setLoading] = useState(false);

  async function handleApply() {
    setLoading(true);
    try {
      const res = await fetch(`/api/shifts/${shiftId}/apply`, {
        method: "POST",
      });

      if (res.status === 201) {
        setApplied(true);
        toast.success(t("application_sent"));
        return;
      }

      const data = await res.json().catch(() => ({}));

      if (data.error === "ALREADY_APPLIED") {
        setApplied(true);
        toast.info(t("application_already_applied"));
        return;
      }

      if (res.status === 401) {
        toast.error(t("sign_in_to_apply"));
        return;
      }

      toast.error(data.error ?? t("error_retry"));
    } catch {
      toast.error(t("error_network"));
    } finally {
      setLoading(false);
    }
  }

  if (applied) {
    return (
      <Button disabled variant="outline" size="sm" className="border-primary text-primary">
        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
        {t("applied")}
      </Button>
    );
  }

  return (
    <Button size="sm" onClick={handleApply} disabled={loading}>
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
      ) : (
        <Send className="h-3.5 w-3.5 mr-1.5" />
      )}
      {t("quick_apply")}
    </Button>
  );
}
