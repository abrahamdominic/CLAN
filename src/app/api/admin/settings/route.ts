import { NextResponse } from "next/server";
import { adminGetSettings } from "@/lib/admin-db";

export async function GET() {
  try {
    const data = await adminGetSettings();
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ data: null });
  }
}
