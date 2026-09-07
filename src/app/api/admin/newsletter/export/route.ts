import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { adminExportNewsletterSubscribers } from "@/lib/admin-db";
import { toCsv, downloadCsvResponse } from "@/lib/csv";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authorized = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const status = (searchParams.get("status") || "all") as "active" | "inactive" | "all";

  try {
    const subscribers = await adminExportNewsletterSubscribers({ search, status });

    const headers = [
      "Name",
      "Email Address",
      "Phone Number",
      "Subscription Date",
      "Subscription Status",
    ];

    const rows = subscribers.map((s) => [
      s.name || "",
      s.email,
      s.phone_number || "",
      s.created_at ? new Date(s.created_at).toISOString() : "",
      s.active ? "Active" : "Inactive",
    ]);

    const csv = toCsv(headers, rows);
    const date = new Date().toISOString().slice(0, 10);
    const filename = `clan-newsletter-subscribers-${date}.csv`;

    return downloadCsvResponse(csv, filename);
  } catch {
    return NextResponse.json({ error: "Export failed." }, { status: 500 });
  }
}