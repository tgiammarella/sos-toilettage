"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Bookmark, BookmarkCheck } from "lucide-react";

export function ShortlistButton({
  applicationId,
  shortlisted,
}: {
  applicationId: string;
  shortlisted: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/jobs/applications/${applicationId}/shortlist`,
        { method: "POST" }
      );
      if (!res.ok) {
        toast.error("Une erreur est survenue.");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      size="sm"
      variant={shortlisted ? "secondary" : "outline"}
      onClick={toggle}
      disabled={loading}
      title={shortlisted ? "Retirer de la sélection" : "Ajouter à la sélection"}
    >
      {shortlisted ? (
        <BookmarkCheck className="h-3.5 w-3.5" />
      ) : (
        <Bookmark className="h-3.5 w-3.5" />
      )}
    </Button>
  );
}
