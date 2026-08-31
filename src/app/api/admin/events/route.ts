import { NextResponse } from "next/server";
import { adminGetEvents } from "@/lib/admin-db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") || 1);
  const search = searchParams.get("search") || undefined;
  try {
    const data = await adminGetEvents(page, 20, search);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ data: [], count: 0 });
  }
}
