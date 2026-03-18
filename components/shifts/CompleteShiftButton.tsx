"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface Props {
  shiftId: string;
  locale: string;
}

export function CompleteShiftButton({ shiftId, locale }: Props) {
  const router = useRouter();
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
          toast.error(
            locale === "fr"
              ? "Le remplacement ne peut pas être complété avant l'heure prévue."
              : "The shift cannot be completed before the scheduled time.",
          );
        } else {
          toast.error(
            locale === "fr" ? "Une erreur est survenue." : "An error occurred.",
          );
        }
        setConfirming(false);
        return;
      }

      toast.success(
        locale === "fr"
          ? "Remplacement marqué comme complété !"
          : "Shift marked as completed!",
      );
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
        {locale === "fr"
          ? "Confirmer que le remplacement a été complété"
          : "Confirm shift was completed"}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">
        {locale === "fr" ? "Confirmer ?" : "Confirm?"}
      </span>
      <Button size="sm" onClick={handleComplete} disabled={loading}>
        {loading
          ? (locale === "fr" ? "Enregistrement…" : "Saving…")
          : (locale === "fr" ? "Oui, complété" : "Yes, completed")}
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setConfirming(false)} disabled={loading}>
        {locale === "fr" ? "Non" : "No"}
      </Button>
    </div>
  );
}
