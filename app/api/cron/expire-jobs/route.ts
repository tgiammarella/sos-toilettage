import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/cron/expire-jobs
 * Bulk-expire PUBLISHED jobs past their expiresAt date.
 * Protected by CRON_SECRET bearer token.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }

  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const result = await prisma.jobPost.updateMany({
    where: {
      status: "PUBLISHED",
      expiresAt: { lt: now },
    },
    data: { status: "EXPIRED" },
  });

  return NextResponse.json({
    expired: result.count,
    at: now.toISOString(),
  });
}
