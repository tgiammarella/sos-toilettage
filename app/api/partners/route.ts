import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPartnersPage, stripPromoFieldsList } from "@/lib/partners";

export async function GET(req: NextRequest) {
  const session = await auth();
  const url = new URL(req.url);
  const search = url.searchParams.get("search") ?? undefined;
  const category = url.searchParams.get("category") ?? undefined;
  const cursor = url.searchParams.get("cursor") ?? undefined;
  const limit = parseInt(url.searchParams.get("limit") ?? "24", 10);

  const result = await getPartnersPage({
    search,
    category,
    cursor,
    limit: Math.min(limit, 48),
  });

  if (!session) {
    result.partners = stripPromoFieldsList(result.partners);
  }

  return NextResponse.json(result);
}
