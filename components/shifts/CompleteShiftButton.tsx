"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface Props {
  shiftId: string;
  locale: string;
}

export function CompleteShiftButton({ shiftId }: Props) {
  const router = useRouter();
  const t = useTranslations("ui");
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleComplete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/shifts/${shiftId}/complete`, { method: "POST" });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const code = (body as { error?: string }).error;
        if (code === "TOO_EARLY") {
          toast.error(t("shift_too_early"));
        } else {
          toast.error(t("error_generic"));
        }
        setConfirming(false);
        return;
      }

      toast.success(t("shift_completed"));
      router.refresh();
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  }

  if (!confirming) {
    return (
      <Button size="sm" variant="outline" onClick={() => setConfirming(true)}>
        <CheckCircle2 className="h-4 w-4 mr-1.5" />
        {t("shift_confirm_complete")}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">
        {t("confirm_q")}
      </span>
      <Button size="sm" onClick={handleComplete} disabled={loading}>
        {loading ? t("saving") : t("shift_yes_completed")}
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setConfirming(false)} disabled={loading}>
        {t("no")}
      </Button>
    </div>
  );
}
