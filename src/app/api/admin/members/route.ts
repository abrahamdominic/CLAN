import { NextResponse } from "next/server";
import { adminGetMembers, adminUpdateMemberStatus } from "@/lib/admin-db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") || 1);
  const search = searchParams.get("search") || undefined;
  const status = searchParams.get("status") || "all";
  try {
    const data = await adminGetMembers(page, 20, search, status);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ data: [], count: 0 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();
    const result = await adminUpdateMemberStatus(id, status);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 400 });
  }
}
