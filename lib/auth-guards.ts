import { auth } from "@/auth";
import { redirect, forbidden } from "next/navigation";
import type { Session } from "next-auth";

/**
 * Requires an authenticated session with exactly the given role.
 * - No session → redirects to login
 * - Wrong role → throws 403 (renders app/forbidden.tsx)
 *
 * Usage in Server Components:
 *   const session = await requireRole(locale, "SALON");
 */
export async function requireRole(locale: string, role: string): Promise<Session> {
  const session = await auth();

  if (!session) {
    redirect(`/${locale}/auth/login`);
  }

  if (session.user.role !== role) {
    forbidden();
  }

  return session as Session;
}
