import Image from "next/image";

type Tier = "DECOUVERTE" | "VEDETTE" | "SIGNATURE";
type BadgeSize = "sm" | "md" | "lg";

/** Heights in px — width computed from 3:2 aspect ratio */
const HEIGHT_PX: Record<BadgeSize, number> = {
  sm: 32,
  md: 54,
  lg: 80,
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
  const h = HEIGHT_PX[size];
  const w = Math.round(h * 1.5); // 3:2 aspect ratio

  return (
    <Image
      src={config.src}
      alt={config.alt}
      width={w}
      height={h}
      className={`drop-shadow-md object-contain ${className}`}
    />
  );
}
