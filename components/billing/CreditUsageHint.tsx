import { Coins } from "lucide-react";

/**
 * Displays a credit usage banner before publishing a post.
 * Works in both server and client components.
 *
 * @param creditsAvailable  - Current credit balance for the salon.
 * @param costCredits       - Credits consumed by the action (0 = free).
 * @param locale            - "fr" | "en" (or any other → defaults to fr).
 */
export function CreditUsageHint({
  creditsAvailable,
  costCredits,
  locale,
}: {
  creditsAvailable: number;
  costCredits: number;
  locale: string;
}) {
  const lang = locale === "en" ? "en" : "fr";
  const hasEnough = creditsAvailable >= costCredits;

  if (costCredits === 0) {
    const message =
      lang === "fr"
        ? `${creditsAvailable} crédit${creditsAvailable !== 1 ? "s" : ""} disponible${creditsAvailable !== 1 ? "s" : ""}. La publication d'une offre d'emploi est gratuite.`
        : `${creditsAvailable} credit${creditsAvailable !== 1 ? "s" : ""} available. Publishing a job offer is free.`;
    return (
      <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
        <Coins className="h-4 w-4 shrink-0" />
        {message}
      </div>
    );
  }

  const message = !hasEnough
    ? lang === "fr"
      ? "Aucun crédit disponible. Achetez un forfait pour publier un remplacement."
      : "No credits available. Purchase a plan to publish a shift."
    : lang === "fr"
    ? `${creditsAvailable} crédit${creditsAvailable !== 1 ? "s" : ""} disponible${creditsAvailable !== 1 ? "s" : ""}. La publication en consommera ${costCredits}.`
    : `${creditsAvailable} credit${creditsAvailable !== 1 ? "s" : ""} available. Publishing will use ${costCredits}.`;

  return (
    <div
      className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
        !hasEnough
          ? "border-destructive/40 bg-destructive/5 text-destructive"
          : "border-primary/20 bg-primary/5 text-primary"
      }`}
    >
      <Coins className="h-4 w-4 shrink-0" />
      {message}
    </div>
  );
}
