"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  const [applied, setApplied] = useState(alreadyApplied);
  const [loading, setLoading] = useState(false);

  if (isFilled) {
    return (
      <Button disabled variant="secondary">
        <CheckCircle className="h-4 w-4 mr-1.5" />
        Remplacement comblé
      </Button>
    );
  }

  // Not logged in → redirect to login with callback
  if (!userRole) {
    return (
      <Button asChild>
        <Link href={`/${locale}/auth/login?callbackUrl=/${locale}/shifts/${shiftId}`}>
          <LogIn className="h-4 w-4 mr-1.5" />
          Postuler
        </Link>
      </Button>
    );
  }

  // Salons and admins don't apply
  if (userRole !== "GROOMER") return null;

  if (applied) {
    return (
      <Button disabled variant="outline" className="border-primary text-primary">
        <CheckCircle className="h-4 w-4 mr-1.5" />
        Candidature envoyée
      </Button>
    );
  }

  async function handleApply() {
    setLoading(true);
    try {
      const res = await fetch(`/api/shifts/${shiftId}/apply`, { method: "POST" });

      if (res.status === 409) {
        toast.info("Vous avez déjà postulé pour ce remplacement.");
        setApplied(true);
        return;
      }
      if (!res.ok) {
        toast.error("Une erreur est survenue. Veuillez réessayer.");
        return;
      }

      setApplied(true);
      toast.success("Candidature envoyée avec succès !");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleApply} disabled={loading}>
      {loading ? "Envoi…" : "Postuler"}
    </Button>
  );
}
