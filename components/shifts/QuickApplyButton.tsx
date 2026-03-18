"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, Send, CheckCircle2 } from "lucide-react";

export function QuickApplyButton({
  shiftId,
  alreadyApplied,
  locale,
}: {
  shiftId: string;
  alreadyApplied: boolean;
  locale: string;
}) {
  const lang = locale === "fr" ? "fr" : "en";
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
        toast.success(
          lang === "fr" ? "Candidature envoyée" : "Application sent",
        );
        return;
      }

      const data = await res.json().catch(() => ({}));

      if (data.error === "ALREADY_APPLIED") {
        setApplied(true);
        toast.info(
          lang === "fr" ? "Vous avez déjà postulé" : "Already applied",
        );
        return;
      }

      if (res.status === 401) {
        toast.error(
          lang === "fr"
            ? "Connectez-vous pour postuler"
            : "Sign in to apply",
        );
        return;
      }

      toast.error(
        data.error ??
          (lang === "fr" ? "Erreur, veuillez réessayer" : "Error, please retry"),
      );
    } catch {
      toast.error(
        lang === "fr" ? "Erreur réseau" : "Network error",
      );
    } finally {
      setLoading(false);
    }
  }

  if (applied) {
    return (
      <Button disabled variant="outline" size="sm" className="border-primary text-primary">
        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
        {lang === "fr" ? "Postulé" : "Applied"}
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
      {lang === "fr" ? "Postuler en 1 clic" : "1-click apply"}
    </Button>
  );
}
