import { NextResponse } from "next/server";
import { adminGetCategories } from "@/lib/admin-db";

export async function GET() {
  try {
    const data = await adminGetCategories();
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ data: [] });
  }
}
