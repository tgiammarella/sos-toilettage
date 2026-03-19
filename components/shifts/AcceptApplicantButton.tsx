"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UserCheck } from "lucide-react";

export function AcceptApplicantButton({
  shiftId,
  applicationId,
}: {
  shiftId: string;
  applicationId: string;
}) {
  const router = useRouter();
  const t = useTranslations("ui");
  const [loading, setLoading] = useState(false);

  async function handleAccept() {
    setLoading(true);
    try {
      const res = await fetch(`/api/shifts/${shiftId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error((err as { error?: string }).error ?? t("error_generic"));
        return;
      }

      toast.success(t("application_accepted"));
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" onClick={handleAccept} disabled={loading}>
      <UserCheck className="h-3.5 w-3.5 mr-1.5" />
      {loading ? t("accepting") : t("accept")}
    </Button>
  );
}
