"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReviewFormProps {
  engagementId: string;
  locale: string;
  onSuccess?: () => void;
}

export function ReviewForm({ engagementId, locale, onSuccess }: ReviewFormProps) {
  const lang = locale === "en" ? "en" : "fr";
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  if (status === "done") {
    return (
      <p className="text-sm text-emerald-600 font-medium">
        {lang === "fr" ? "Avis envoyé ✓" : "Review submitted ✓"}
      </p>
    );
  }

  async function handleSubmit() {
    if (rating === 0) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ engagementId, rating, text: text.trim() || undefined }),
      });
      if (res.ok) {
        setStatus("done");
        onSuccess?.();
      } else if (res.status === 409) {
        setStatus("done"); // already reviewed
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  const displayRating = hovered || rating;

  return (
    <div className="space-y-3">
      {/* Star picker */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            className="p-0.5 focus:outline-none"
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
          >
            <Star
              className={`h-5 w-5 transition-colors ${
                n <= displayRating
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/30"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Optional comment */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={lang === "fr" ? "Commentaire (optionnel)" : "Comment (optional)"}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        rows={2}
        maxLength={500}
      />

      {status === "error" && (
        <p className="text-xs text-destructive">
          {lang === "fr" ? "Une erreur est survenue." : "An error occurred."}
        </p>
      )}

      <Button
        size="sm"
        onClick={handleSubmit}
        disabled={rating === 0 || status === "loading"}
      >
        {status === "loading"
          ? lang === "fr" ? "Envoi…" : "Sending…"
          : lang === "fr" ? "Envoyer l'avis" : "Submit review"}
      </Button>
    </div>
  );
}
