"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle, LogIn } from "lucide-react";

interface ApplyButtonProps {
  shiftId: string;
  locale: string;
  /** null = not authenticated */
  userRole: string | null;
  alreadyApplied: boolean;
  isFilled: boolean;
}

export function ApplyButton({
  shiftId,
  locale,
  userRole,
  alreadyApplied,
  isFilled,
}: ApplyButtonProps) {
  const router = useRouter();
  const t = useTranslations("ui");
  const [applied, setApplied] = useState(alreadyApplied);
  const [loading, setLoading] = useState(false);

  if (isFilled) {
    return (
      <Button disabled variant="secondary">
        <CheckCircle className="h-4 w-4 mr-1.5" />
        {t("shift_filled")}
      </Button>
    );
  }

  if (!userRole) {
    return (
      <Button asChild>
        <Link href={`/${locale}/auth/login?callbackUrl=/${locale}/shifts/${shiftId}`}>
          <LogIn className="h-4 w-4 mr-1.5" />
          {t("apply")}
        </Link>
      </Button>
    );
  }

  if (userRole !== "GROOMER") return null;

  if (applied) {
    return (
      <Button disabled variant="outline" className="border-primary text-primary">
        <CheckCircle className="h-4 w-4 mr-1.5" />
        {t("application_sent_label")}
      </Button>
    );
  }

  async function handleApply() {
    setLoading(true);
    try {
      const res = await fetch(`/api/shifts/${shiftId}/apply`, { method: "POST" });

      if (res.status === 409) {
        toast.info(t("application_already_applied"));
        setApplied(true);
        return;
      }
      if (!res.ok) {
        toast.error(t("error_generic"));
        return;
      }

      setApplied(true);
      toast.success(t("application_sent"));
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleApply} disabled={loading}>
      {loading ? t("sending") : t("apply")}
    </Button>
  );
}
