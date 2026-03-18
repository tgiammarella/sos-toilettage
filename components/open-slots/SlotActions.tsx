"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { getLang } from "@/lib/labels";

export function SlotActions({ slotId, locale }: { slotId: string; locale: string }) {
  const lang = getLang(locale);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function update(status: "FILLED" | "CANCELLED") {
    setLoading(true);
    try {
      const res = await fetch(`/api/open-slots/${slotId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success(lang === "fr" ? "Statut mis à jour." : "Status updated.");
        router.refresh();
      } else {
        toast.error(lang === "fr" ? "Erreur." : "Error.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <Button size="sm" variant="outline" disabled={loading} onClick={() => update("FILLED")}>
        <CheckCircle className="h-3.5 w-3.5 mr-1" />
        {lang === "fr" ? "Comblé" : "Filled"}
      </Button>
      <Button size="sm" variant="ghost" disabled={loading} onClick={() => update("CANCELLED")}>
        <XCircle className="h-3.5 w-3.5 mr-1" />
        {lang === "fr" ? "Annuler" : "Cancel"}
      </Button>
    </div>
  );
}
