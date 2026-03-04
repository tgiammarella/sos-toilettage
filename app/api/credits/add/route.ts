import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { addCredits } from "@/lib/credits";

const AddCreditsSchema = z.object({
  salonId: z.string().min(1),
  amount: z.coerce.number().int().min(1).max(1000),
  reason: z.string().min(1).default("ADMIN_ADJUSTMENT"),
});

/**
 * POST /api/credits/add
 * Admin-only endpoint to add credits to a salon.
 * Stripe webhooks will call addCredits() directly in the webhook handler.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = AddCreditsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", issues: parsed.error.flatten() }, { status: 422 });
  }

  const { salonId, amount, reason } = parsed.data;

  try {
    const creditsAvailable = await addCredits(salonId, amount, reason);
    return NextResponse.json({ creditsAvailable }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
