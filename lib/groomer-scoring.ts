import type { GroomerProfile } from "@prisma/client";

/**
 * Calculates a 0–100 profile completeness score based on filled fields.
 * Used both for scoring candidates and for displaying completeness in the dashboard.
 */
export function calculateProfileScore(groomer: Pick<
  GroomerProfile,
  "bio" | "yearsExperience" | "specializations" | "city" | "cvFileUrl" | "photoUrl"
>): number {
  const checks = [
    !!groomer.bio,
    groomer.yearsExperience > 0,
    safeParseJson(groomer.specializations).length > 0,
    !!groomer.city,
    !!groomer.cvFileUrl,
    !!groomer.photoUrl,
  ];
  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
}

/**
 * Scores a groomer for a specific shift on a 0–100 scale.
 *
 * Breakdown:
 *   - City exact match:      40 pts
 *   - Same region only:      20 pts
 *   - Specialty match:       0–30 pts (proportional to criteria overlap)
 *   - Available today:       20 pts
 *   - Profile completeness:  0–10 pts
 */
export function scoreGroomerForShift(
  groomer: Pick<
    GroomerProfile,
    "city" | "region" | "yearsExperience" | "specializations" | "bio" | "cvFileUrl" | "photoUrl" | "availableToday"
  >,
  shiftCity: string,
  shiftRegion: string,
  shiftCriteria: string[],
): number {
  let score = 0;

  // Location (40 pts max)
  if (groomer.city.toLowerCase() === shiftCity.toLowerCase()) {
    score += 40;
  } else if (groomer.region === shiftRegion) {
    score += 20;
  }

  // Specialty match (30 pts max)
  const specs = safeParseJson(groomer.specializations);
  if (shiftCriteria.length > 0) {
    const matches = specs.filter((s: string) => shiftCriteria.includes(s)).length;
    score += Math.round((matches / shiftCriteria.length) * 30);
  } else {
    // No criteria = neutral bonus (platform decides relevance)
    score += 15;
  }

  // Availability (20 pts)
  if (groomer.availableToday) {
    score += 20;
  }

  // Profile completeness (10 pts max)
  score += Math.round((calculateProfileScore(groomer) / 100) * 10);

  return score;
}

function safeParseJson(value: string): string[] {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
