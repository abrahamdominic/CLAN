import { NextResponse } from "next/server";
import { adminGetBlogPosts } from "@/lib/admin-db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") || 1);
  const search = searchParams.get("search") || undefined;
  const category = searchParams.get("category") || undefined;
  const status = searchParams.get("status") || undefined;
  try {
    const data = await adminGetBlogPosts(page, 20, search, category, status);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ data: [], count: 0, categories: [] });
  }
}
