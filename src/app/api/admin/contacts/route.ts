import { NextResponse } from "next/server";
import { adminGetContacts, adminMarkContactRead } from "@/lib/admin-db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") || 1);
  try {
    const data = await adminGetContacts(page, 20);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ data: [], count: 0 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, read } = await request.json();
    const result = await adminMarkContactRead(id, read);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 400 });
  }
}
