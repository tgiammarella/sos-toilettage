"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { UserCheck, UserX } from "lucide-react";

interface JobDecisionButtonsProps {
  jobId: string;
  applicationId: string;
  groomerName: string;
}

export function JobDecisionButtons({
  jobId,
  applicationId,
  groomerName,
}: JobDecisionButtonsProps) {
  const router = useRouter();
  const t = useTranslations("ui");
  const [open, setOpen] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const busy = accepting || rejecting;

  async function handleAccept() {
    setAccepting(true);
    try {
      const res = await fetch(
        `/api/jobs/${jobId}/applications/${applicationId}/accept`,
        { method: "POST" }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error((err as { error?: string }).error ?? t("error_generic"));
        return;
      }

      setOpen(false);
      toast.success(t("application_accepted_filled"));
      router.refresh();
    } finally {
      setAccepting(false);
    }
  }

  async function handleReject() {
    setRejecting(true);
    try {
      const res = await fetch(
        `/api/jobs/${jobId}/applications/${applicationId}/reject`,
        { method: "POST" }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error((err as { error?: string }).error ?? t("error_generic"));
        return;
      }

      toast.success(t("application_rejected"));
      router.refresh();
    } finally {
      setRejecting(false);
    }
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      {/* Accept — guarded by confirm dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" disabled={busy}>
            <UserCheck className="h-3.5 w-3.5 mr-1.5" />
            {t("accept")}
          </Button>
        </DialogTrigger>
        <DialogContent showCloseButton={false} className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("confirm_accept")}</DialogTitle>
            <DialogDescription>
              {t("confirm_accept_desc", { name: groomerName })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={accepting}
            >
              {t("cancel")}
            </Button>
            <Button onClick={handleAccept} disabled={accepting}>
              <UserCheck className="h-3.5 w-3.5 mr-1.5" />
              {accepting ? t("accepting") : t("confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject — direct, no confirmation */}
      <Button
        size="sm"
        variant="outline"
        onClick={handleReject}
        disabled={busy}
      >
        <UserX className="h-3.5 w-3.5 mr-1.5" />
        {rejecting ? t("rejecting") : t("reject")}
      </Button>
    </div>
  );
}
