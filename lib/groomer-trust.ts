export type BadgeKey =
  | "cv_available"
  | "complete_profile"
  | "confirmed_experience"
  | "highly_rated"
  | "multiple_specialties";

export interface TrustBadge {
  key: BadgeKey;
  labelFr: string;
  labelEn: string;
}

const ALL_BADGES: TrustBadge[] = [
  { key: "cv_available",          labelFr: "CV disponible",        labelEn: "CV available" },
  { key: "complete_profile",      labelFr: "Profil complet",       labelEn: "Complete profile" },
  { key: "confirmed_experience",  labelFr: "Expérience confirmée", labelEn: "Verified experience" },
  { key: "highly_rated",          labelFr: "Très bien évalué",     labelEn: "Highly rated" },
  { key: "multiple_specialties",  labelFr: "Spécialités multiples", labelEn: "Multiple specialties" },
];

export interface GroomerProfileInput {
  cvFileUrl: string | null;
  photoUrl: string | null;
  bio: string | null;
  city: string;
  specializations: string; // JSON string: string[]
  yearsExperience: number;
}

export interface ReviewStats {
  count: number;
  average: number;
}

export function computeTrustBadges(
  profile: GroomerProfileInput,
  reviewStats: ReviewStats,
): TrustBadge[] {
  let specs: string[] = [];
  try { specs = JSON.parse(profile.specializations || "[]"); } catch { /* empty */ }

  const earned = new Set<BadgeKey>();

  if (profile.cvFileUrl) earned.add("cv_available");

  if (profile.photoUrl && profile.bio && profile.city && specs.length > 0) {
    earned.add("complete_profile");
  }

  if (profile.yearsExperience >= 2) earned.add("confirmed_experience");

  if (reviewStats.average >= 4.5 && reviewStats.count >= 3) earned.add("highly_rated");

  if (specs.length >= 3) earned.add("multiple_specialties");

  // Return max 4 badges to avoid clutter, in stable display order
  return ALL_BADGES.filter((b) => earned.has(b.key)).slice(0, 4);
}
