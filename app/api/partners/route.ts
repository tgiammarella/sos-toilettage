import { NextRequest, NextResponse } from "next/server";
import { getPartnersPage } from "@/lib/partners";

export async function GET(req: NextRequest) {
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

  return NextResponse.json(result);
}
