import { NextResponse } from "next/server";
import { adminGetTestimonials } from "@/lib/admin-db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") || 1);
  try {
    const data = await adminGetTestimonials(page, 20);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ data: [], count: 0 });
  }
}
