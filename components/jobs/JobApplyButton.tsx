"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle, LogIn, Ban } from "lucide-react";

interface JobApplyButtonProps {
  jobId: string;
  locale: string;
  userRole: string | null;
  alreadyApplied: boolean;
  isFilled: boolean;
}

export function JobApplyButton({
  jobId,
  locale,
  userRole,
  alreadyApplied,
  isFilled,
}: JobApplyButtonProps) {
  const router = useRouter();
  const t = useTranslations("ui");
  const [applied, setApplied] = useState(alreadyApplied);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [availabilityDates, setAvailabilityDates] = useState("");

  if (isFilled) {
    return (
      <Button disabled variant="secondary" className="w-full sm:w-auto">
        <CheckCircle className="h-4 w-4 mr-1.5" />
        {t("job_filled")}
      </Button>
    );
  }

  if (!userRole) {
    return (
      <Button asChild className="w-full sm:w-auto">
        <Link href={`/${locale}/auth/login?callbackUrl=/${locale}/jobs/${jobId}`}>
          <LogIn className="h-4 w-4 mr-1.5" />
          {t("login_to_apply")}
        </Link>
      </Button>
    );
  }

  if (userRole !== "GROOMER") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Ban className="h-4 w-4 shrink-0" />
        {t("groomers_only")}
      </div>
    );
  }

  if (applied) {
    return (
      <Button disabled variant="outline" className="w-full sm:w-auto border-primary text-primary">
        <CheckCircle className="h-4 w-4 mr-1.5" />
        {t("application_sent_label")}
      </Button>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim() || undefined,
          availabilityDates: availabilityDates.trim() || undefined,
        }),
      });

      if (res.status === 401) {
        toast.error(t("error_session_expired"));
        return;
      }
      if (res.status === 409) {
        toast.info(t("application_already_applied"));
        setApplied(true);
        setOpen(false);
        return;
      }
      if (!res.ok) {
        toast.error(t("error_generic"));
        return;
      }

      setApplied(true);
      setOpen(false);
      toast.success(t("application_sent"));
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="w-full sm:w-auto">
        {t("apply")}
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border bg-card p-5 space-y-4 shadow-sm"
    >
      <h3 className="font-semibold text-base">{t("your_application")}</h3>

      <div className="space-y-1.5">
        <Label htmlFor="apply-message">
          {t("message_label")} <span className="text-muted-foreground font-normal">({t("message_optional")})</span>
        </Label>
        <textarea
          id="apply-message"
          maxLength={500}
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("message_placeholder")}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
        />
        <p className="text-xs text-muted-foreground text-right">{message.length}/500</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="apply-availability">
          {t("availability_label")} <span className="text-muted-foreground font-normal">({t("availability_optional")})</span>
        </Label>
        <input
          id="apply-availability"
          type="text"
          maxLength={200}
          value={availabilityDates}
          onChange={(e) => setAvailabilityDates(e.target.value)}
          placeholder={t("availability_placeholder")}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="space-y-1.5">
        <Label>
          {t("cv_label")} <span className="text-muted-foreground font-normal">({t("cv_coming_soon")})</span>
        </Label>
        <input
          type="file"
          disabled
          className="w-full text-sm text-muted-foreground cursor-not-allowed opacity-50"
        />
      </div>

      <div className="flex gap-3 pt-1">
        <Button type="submit" disabled={loading} className="flex-1 sm:flex-none">
          {loading ? t("sending") : t("send_application")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setOpen(false)}
          disabled={loading}
        >
          {t("cancel")}
        </Button>
      </div>
    </form>
  );
}
