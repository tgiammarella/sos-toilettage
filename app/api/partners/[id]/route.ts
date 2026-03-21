import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPartnerById, stripPromoFields } from "@/lib/partners";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const { id } = await params;
  const partner = await getPartnerById(id);

  if (!partner) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(session ? partner : stripPromoFields(partner));
}
