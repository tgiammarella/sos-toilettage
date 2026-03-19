import Image from "next/image";

type Tier = "DECOUVERTE" | "VEDETTE" | "SIGNATURE";
type BadgeSize = "sm" | "md" | "lg";

const SIZE_PX: Record<BadgeSize, number> = {
  sm: 48,
  md: 80,
  lg: 120,
};

const BADGE_CONFIG: Record<
  Exclude<Tier, "DECOUVERTE">,
  { src: string; alt: string }
> = {
  VEDETTE: {
    src: "/badges/partenaire_vedette_badge.png",
    alt: "Partenaire Vedette — ToutToilettage",
  },
  SIGNATURE: {
    src: "/badges/partenaire_signature_badge.png",
    alt: "Partenaire Signature — ToutToilettage",
  },
};

interface PartnerBadgeProps {
  tier: string;
  size?: BadgeSize;
  className?: string;
}

export function PartnerBadge({
  tier,
  size = "md",
  className = "",
}: PartnerBadgeProps) {
  if (tier === "DECOUVERTE" || !(tier in BADGE_CONFIG)) return null;

  const config = BADGE_CONFIG[tier as Exclude<Tier, "DECOUVERTE">];
  const px = SIZE_PX[size];

  return (
    <Image
      src={config.src}
      alt={config.alt}
      width={px}
      height={px}
      className={`drop-shadow-md ${className}`}
    />
  );
}
