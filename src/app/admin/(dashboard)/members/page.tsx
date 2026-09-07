"use client";

import { useState, useEffect, useCallback } from "react";
import { Trash2, Download } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminTable } from "@/components/admin/admin-table";
import { Pagination } from "@/components/admin/pagination";
import { Badge } from "@/components/admin/admin-form-fields";
import { formatDate } from "@/lib/utils";
import { adminDelete } from "@/components/admin/admin-actions";
import toast from "react-hot-toast";
import type { MembershipApplication } from "@/types";

type StatusFilter = "all" | "new" | "contacted" | "joined" | "archived";

export default function AdminMembersPage() {
  const [members, setMembers] = useState<MembershipApplication[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const perPage = 20;

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set("search", search);
      if (status !== "all") params.set("status", status);
      const res = await fetch(`/api/admin/members?${params.toString()}`);
      const data = await res.json();
      setMembers(data.data);
      setCount(data.count);
    } catch { /* empty */ }
  }, [page, search, status]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this application?")) return;
    const result = await adminDelete("membership_applications", id);
    if (result.error) toast.error(result.error);
    else { toast.success("Deleted"); load(); }
  }

  async function handleStatus(id: string, status: string) {
    try {
      const res = await fetch("/api/admin/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (data.error) toast.error(data.error);
      else { toast.success("Status updated"); load(); }
    } catch { toast.error("Failed to update"); }
  }

  async function handleExport() {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (status !== "all") params.set("status", status);
      const res = await fetch(`/api/admin/members/export?${params.toString()}`, {
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Export failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const cd = res.headers.get("Content-Disposition") || "";
      const match = cd.match(/filename="?([^";]+)"?/);
      a.download = match?.[1] || `clan-members-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Members exported");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    }
  }

  const statusVariant = (s: string) => s === "joined" ? "success" : s === "new" ? "info" : s === "archived" ? "default" : "warning";

  return (
    <>
      <AdminPageHeader
        title="Members"
        description="Manage membership applications"
        action={
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy-800"
          >
            <Download className="h-4 w-4" />
            Export Members CSV
          </button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input type="search" placeholder="Search by name..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-full max-w-sm rounded-lg border border-navy-200 px-4 py-2 text-sm text-navy-900 placeholder:text-navy-400 focus:border-gold-400 focus:outline-none" />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value as StatusFilter); setPage(1); }}
          className="w-full max-w-[160px] rounded-lg border border-navy-200 px-3 py-2 text-sm text-navy-700 focus:border-gold-400 focus:outline-none"
          aria-label="Filter by status"
        >
          <option value="all">All</option>
          <option value="new">Pending</option>
          <option value="contacted">Contacted</option>
          <option value="joined">Approved</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <AdminTable
        columns={[
          { key: "full_name", label: "Name", render: (m) => <span className="font-medium text-navy-900">{m.full_name}</span> },
          { key: "email", label: "Email" },
          { key: "location", label: "Location" },
          { key: "areas_of_interest", label: "Interests", render: (m) => (m.areas_of_interest as string[])?.slice(0, 3).map((a: string) => <Badge key={a}>{a}</Badge>) || "-" },
          { key: "status", label: "Status", render: (m) => <Badge variant={statusVariant(m.status)}>{m.status}</Badge> },
          { key: "created_at", label: "Applied", render: (m) => formatDate(m.created_at) },
          {
            key: "actions", label: "", className: "w-32",
            render: (m) => (
              <div className="flex items-center gap-1">
                <select
                  defaultValue={m.status}
                  onChange={(e) => handleStatus(m.id, e.target.value)}
                  className="rounded border border-navy-200 px-2 py-1 text-xs text-navy-700"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="joined">Joined</option>
                  <option value="archived">Archived</option>
                </select>
                <button onClick={() => handleDelete(m.id)} className="rounded p-1.5 text-red-400 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ),
          },
        ]}
        data={members}
        emptyMessage="No membership applications yet."
      />

      <Pagination page={page} total={count} perPage={perPage} onPageChange={setPage} />
    </>
  );
}