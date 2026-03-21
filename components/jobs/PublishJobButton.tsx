"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { JOB_POSTING } from "@/lib/pricing";

export function PublishJobButton({
  jobId,
  locale,
}: {
  jobId: string;
  locale: string;
}) {
  const lang = locale === "fr" ? "fr" : "en";
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handlePublish() {
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/publish`, { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error(
          (body as { error?: string }).error ??
            (lang === "fr" ? "Erreur lors de la publication." : "Error publishing."),
        );
        return;
      }
      toast.success(
        lang === "fr"
          ? `Offre publiée pour ${JOB_POSTING.durationDays} jours !`
          : `Job posted for ${JOB_POSTING.durationDays} days!`,
      );
      router.refresh();
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  }

  if (!confirming) {
    return (
      <Button size="sm" onClick={() => setConfirming(true)}>
        {lang === "fr"
          ? `Publier — ${JOB_POSTING.priceCAD} $ / ${JOB_POSTING.durationDays} jours`
          : `Publish — $${JOB_POSTING.priceCAD} / ${JOB_POSTING.durationDays} days`}
      </Button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-sm text-gray-500 text-center">
        {lang === "fr"
          ? `Votre offre sera visible pendant ${JOB_POSTING.durationDays} jours après publication.`
          : `Your posting will be visible for ${JOB_POSTING.durationDays} days after publishing.`}
      </p>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => setConfirming(false)} disabled={loading}>
          {lang === "fr" ? "Annuler" : "Cancel"}
        </Button>
        <Button size="sm" onClick={handlePublish} disabled={loading}>
          {loading && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
          {lang === "fr"
            ? `Confirmer — ${JOB_POSTING.priceCAD} $`
            : `Confirm — $${JOB_POSTING.priceCAD}`}
        </Button>
      </div>
    </div>
  );
}
