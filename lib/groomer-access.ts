import { prisma } from "@/lib/prisma";

/**
 * Determines whether the current user can view full groomer profile details
 * (last name, phone, email, contact buttons).
 *
 * Access is granted if ANY of these are true:
 *   1. role === "GROOMER" (groomers can always see each other)
 *   2. role === "ADMIN"
 *   3. role === "SALON" AND salonProfile.creditsAvailable >= 1
 *   4. role === "SALON" AND salonProfile.subscriptionPlan is not NONE
 *   5. Unauthenticated → always denied
 */
export function canViewFullGroomerProfile(
  salonProfile: { creditsAvailable: number; subscriptionPlan: string | null } | null,
  role: string | undefined,
): boolean {
  if (!role) return false;

  if (role === "GROOMER" || role === "ADMIN") return true;

  if (role === "SALON" && salonProfile) {
    if (salonProfile.creditsAvailable >= 1) return true;
    if (
      salonProfile.subscriptionPlan &&
      salonProfile.subscriptionPlan !== "NONE"
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Extracts the first name from a fullName string.
 * Splits on the first space and returns everything before it.
 * If there's no space, returns the entire string.
 */
export function extractFirstName(fullName: string): string {
  const spaceIndex = fullName.indexOf(" ");
  return spaceIndex === -1 ? fullName : fullName.slice(0, spaceIndex);
}

/**
 * Loads the salon profile access fields for a given user ID.
 * Returns null if the user has no salon profile.
 */
export async function getSalonAccessProfile(userId: string) {
  return prisma.salonProfile.findUnique({
    where: { userId },
    select: {
      creditsAvailable: true,
      subscriptionPlan: true,
    },
  });
}
