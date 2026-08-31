import { NextResponse } from "next/server";
import { adminGetFaqs } from "@/lib/admin-db";

export async function GET() {
  try {
    const data = await adminGetFaqs();
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ data: [] });
  }
}
