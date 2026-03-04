"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  const [applied, setApplied] = useState(alreadyApplied);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [availabilityDates, setAvailabilityDates] = useState("");

  if (isFilled) {
    return (
      <Button disabled variant="secondary" className="w-full sm:w-auto">
        <CheckCircle className="h-4 w-4 mr-1.5" />
        Poste comblé
      </Button>
    );
  }

  // Not authenticated
  if (!userRole) {
    return (
      <Button asChild className="w-full sm:w-auto">
        <Link href={`/${locale}/auth/login?callbackUrl=/${locale}/jobs/${jobId}`}>
          <LogIn className="h-4 w-4 mr-1.5" />
          Se connecter pour postuler
        </Link>
      </Button>
    );
  }

  // Salon or admin — cannot apply
  if (userRole !== "GROOMER") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Ban className="h-4 w-4 shrink-0" />
        Seuls les toiletteurs peuvent postuler.
      </div>
    );
  }

  // Groomer — already applied
  if (applied) {
    return (
      <Button disabled variant="outline" className="w-full sm:w-auto border-primary text-primary">
        <CheckCircle className="h-4 w-4 mr-1.5" />
        Candidature envoyée
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
        toast.error("Votre session a expiré. Veuillez vous reconnecter.");
        return;
      }
      if (res.status === 409) {
        toast.info("Vous avez déjà postulé à cette offre.");
        setApplied(true);
        setOpen(false);
        return;
      }
      if (!res.ok) {
        toast.error("Une erreur est survenue. Veuillez réessayer.");
        return;
      }

      setApplied(true);
      setOpen(false);
      toast.success("Candidature envoyée avec succès !");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  // Groomer — show button or inline form
  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="w-full sm:w-auto">
        Postuler
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border bg-card p-5 space-y-4 shadow-sm"
    >
      <h3 className="font-semibold text-base">Votre candidature</h3>

      <div className="space-y-1.5">
        <Label htmlFor="apply-message">
          Message <span className="text-muted-foreground font-normal">(optionnel, max 500 car.)</span>
        </Label>
        <textarea
          id="apply-message"
          maxLength={500}
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Présentez-vous brièvement et expliquez pourquoi vous êtes un bon candidat…"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
        />
        <p className="text-xs text-muted-foreground text-right">{message.length}/500</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="apply-availability">
          Disponibilités <span className="text-muted-foreground font-normal">(optionnel)</span>
        </Label>
        <input
          id="apply-availability"
          type="text"
          maxLength={200}
          value={availabilityDates}
          onChange={(e) => setAvailabilityDates(e.target.value)}
          placeholder="Ex: Disponible à partir du 15 mars, les fins de semaine"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="space-y-1.5">
        <Label>
          CV <span className="text-muted-foreground font-normal">(téléversement — bientôt disponible)</span>
        </Label>
        <input
          type="file"
          disabled
          className="w-full text-sm text-muted-foreground cursor-not-allowed opacity-50"
        />
      </div>

      <div className="flex gap-3 pt-1">
        <Button type="submit" disabled={loading} className="flex-1 sm:flex-none">
          {loading ? "Envoi…" : "Envoyer la candidature"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setOpen(false)}
          disabled={loading}
        >
          Annuler
        </Button>
      </div>
    </form>
  );
}
