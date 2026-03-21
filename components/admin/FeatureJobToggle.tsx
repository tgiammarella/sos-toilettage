"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Star, StarOff } from "lucide-react";

export function FeatureJobToggle({
  jobId,
  initialFeatured,
  featureLabel,
  unfeatureLabel,
}: {
  jobId: string;
  initialFeatured: boolean;
  featureLabel: string;
  unfeatureLabel: string;
}) {
  const [isFeatured, setIsFeatured] = useState(initialFeatured);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}/feature`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !isFeatured }),
      });
      if (res.ok) {
        setIsFeatured(!isFeatured);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant={isFeatured ? "outline" : "default"}
      size="sm"
      onClick={toggle}
      disabled={loading}
      className="text-xs gap-1"
    >
      {isFeatured ? (
        <>
          <StarOff className="h-3 w-3" />
          {unfeatureLabel}
        </>
      ) : (
        <>
          <Star className="h-3 w-3" />
          {featureLabel}
        </>
      )}
    </Button>
  );
}
