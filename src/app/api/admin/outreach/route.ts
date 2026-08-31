import { NextResponse } from "next/server";
import { adminGetOutreach } from "@/lib/admin-db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") || 1);
  try {
    const data = await adminGetOutreach(page, 20);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ data: [], count: 0 });
  }
}
