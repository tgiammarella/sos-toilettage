"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
        toast.error((err as { error?: string }).error ?? "Une erreur est survenue.");
        return;
      }

      setOpen(false);
      toast.success("Candidature acceptée. Le poste est maintenant comblé.");
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
        toast.error((err as { error?: string }).error ?? "Une erreur est survenue.");
        return;
      }

      toast.success("Candidature refusée.");
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
            Accepter
          </Button>
        </DialogTrigger>
        <DialogContent showCloseButton={false} className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmer l&apos;acceptation</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point d&apos;accepter{" "}
              <strong className="text-foreground">{groomerName}</strong> pour ce poste.
              Toutes les autres candidatures en attente seront automatiquement refusées
              et le poste sera marqué comme comblé.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={accepting}
            >
              Annuler
            </Button>
            <Button onClick={handleAccept} disabled={accepting}>
              <UserCheck className="h-3.5 w-3.5 mr-1.5" />
              {accepting ? "Acceptation…" : "Confirmer"}
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
        {rejecting ? "Refus…" : "Refuser"}
      </Button>
    </div>
  );
}
