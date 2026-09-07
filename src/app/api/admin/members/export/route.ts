import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { adminExportMembers } from "@/lib/admin-db";
import { toCsv, downloadCsvResponse } from "@/lib/csv";
import type { MembershipApplication } from "@/types";

export const dynamic = "force-dynamic";

const statusMap: Record<string, string> = {
  new: "Pending",
  contacted: "Contacted",
  joined: "Approved",
  archived: "Archived",
};

export async function GET(request: Request) {
  const authorized = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const status = searchParams.get("status") || "all";

  try {
    const members = await adminExportMembers(search, status);

    const headers = [
      "Name",
      "Email Address",
      "Phone Number",
      "Location",
      "Church/Denomination",
      "Areas of Interest",
      "How They Discovered CLAN",
      "Message",
      "Application Date",
      "Status",
    ];

    const rows = (members as MembershipApplication[]).map((m) => [
      m.full_name,
      m.email,
      m.phone || "",
      m.location || "",
      m.church || "",
      Array.isArray(m.areas_of_interest) ? m.areas_of_interest.join("; ") : "",
      m.discovered_via || "",
      m.message || "",
      m.created_at ? new Date(m.created_at).toISOString() : "",
      statusMap[m.status] || m.status,
    ]);

    const csv = toCsv(headers, rows);
    const date = new Date().toISOString().slice(0, 10);
    const filename = `clan-members-${date}.csv`;

    return downloadCsvResponse(csv, filename);
  } catch {
    return NextResponse.json({ error: "Export failed." }, { status: 500 });
  }
}