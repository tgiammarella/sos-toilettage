import { NextResponse } from "next/server";
import { getSalonPublicOpenSlots } from "@/lib/open-slots";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const slots = await getSalonPublicOpenSlots(id);
  return NextResponse.json(slots);
}
