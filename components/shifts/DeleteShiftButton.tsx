"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function DeleteShiftButton({
  shiftId,
  locale,
}: {
  shiftId: string;
  locale: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/shifts/${shiftId}`, { method: "DELETE" });

      if (res.status === 409) {
        const body = await res.json().catch(() => ({}));
        toast.error(
          (body as { message?: string }).message ??
            "Ce remplacement ne peut pas être supprimé."
        );
        setConfirming(false);
        return;
      }
      if (!res.ok) {
        toast.error("Une erreur est survenue.");
        setConfirming(false);
        return;
      }

      toast.success("Remplacement annulé.");
      router.push(`/${locale}/dashboard/salon/shifts`);
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  if (!confirming) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="text-destructive border-destructive/30 hover:bg-destructive/10"
        onClick={() => setConfirming(true)}
      >
        <Trash2 className="h-3.5 w-3.5 mr-1" />
        Annuler le remplacement
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-destructive">Confirmer ?</span>
      <Button
        variant="destructive"
        size="sm"
        disabled={deleting}
        onClick={handleDelete}
      >
        {deleting ? "Suppression…" : "Oui, annuler"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setConfirming(false)}
        disabled={deleting}
      >
        Non
      </Button>
    </div>
  );
}
