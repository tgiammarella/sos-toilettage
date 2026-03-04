"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UserCheck } from "lucide-react";

export function AcceptButton({
  shiftId,
  groomerId,
}: {
  shiftId: string;
  groomerId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleAccept() {
    setLoading(true);
    try {
      const res = await fetch(`/api/shifts/${shiftId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groomerId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error((err as { error?: string }).error ?? "Une erreur est survenue.");
        return;
      }

      toast.success("Candidature acceptée ! Le remplacement est maintenant comblé.");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" onClick={handleAccept} disabled={loading}>
      <UserCheck className="h-3.5 w-3.5 mr-1.5" />
      {loading ? "Acceptation…" : "Accepter"}
    </Button>
  );
}
