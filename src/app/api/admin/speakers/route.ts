import { NextResponse } from "next/server";
import { adminGetSpeakers } from "@/lib/admin-db";

export async function GET() {
  try {
    const data = await adminGetSpeakers();
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ data: [] });
  }
}
