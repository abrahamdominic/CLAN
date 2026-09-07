import { NextResponse } from "next/server";
import { adminGetTeam } from "@/lib/admin-db";

export async function GET() {
  try {
    const data = await adminGetTeam();
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ data: null });
  }
}