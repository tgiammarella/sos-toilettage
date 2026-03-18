import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/auth/verify-email?token=...
 * Verifies a user's email address and redirects to login with success message.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/fr/auth/login?error=invalid_token", req.url));
  }

  const user = await prisma.user.findUnique({
    where: { verifyToken: token },
    select: { id: true, verifyTokenExpiry: true, emailVerified: true },
  });

  if (!user) {
    return NextResponse.redirect(new URL("/fr/auth/login?error=invalid_token", req.url));
  }

  if (user.emailVerified) {
    return NextResponse.redirect(new URL("/fr/auth/login?verified=already", req.url));
  }

  if (user.verifyTokenExpiry && user.verifyTokenExpiry < new Date()) {
    return NextResponse.redirect(new URL("/fr/auth/login?error=token_expired", req.url));
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      verifyToken: null,
      verifyTokenExpiry: null,
    },
  });

  return NextResponse.redirect(new URL("/fr/auth/login?verified=true", req.url));
}
