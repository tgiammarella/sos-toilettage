import { NextRequest, NextResponse } from "next/server";
import { getPartnerById } from "@/lib/partners";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const partner = await getPartnerById(id);

  if (!partner) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(partner);
}
