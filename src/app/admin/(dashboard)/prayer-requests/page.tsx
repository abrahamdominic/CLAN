"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminTable } from "@/components/admin/admin-table";
import { Pagination } from "@/components/admin/pagination";
import { Badge } from "@/components/admin/admin-form-fields";
import { formatDate } from "@/lib/utils";
import { adminDelete, adminToggleField } from "@/components/admin/admin-actions";
import toast from "react-hot-toast";
import type { PrayerRequest } from "@/types";

export default function AdminPrayerRequestsPage() {
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const perPage = 20;

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/prayer-requests?page=${page}&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      setRequests(data.data);
      setCount(data.count);
    } catch { /* empty */ }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this prayer request?")) return;
    const result = await adminDelete("prayer_requests", id);
    if (result.error) toast.error(result.error);
    else { toast.success("Deleted"); load(); }
  }

  async function handlePrayedFor(id: string, value: boolean) {
    const result = await adminToggleField("prayer_requests", id, "prayed_for", value);
    if (result.error) toast.error(result.error);
    else { toast.success(value ? "Marked as prayed for" : "Unmarked"); load(); }
  }

  return (
    <>
      <AdminPageHeader title="Prayer Requests" description="View and manage prayer requests from visitors" />

      <div className="mb-4">
        <input type="search" placeholder="Search by name..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-full max-w-sm rounded-lg border border-navy-200 px-4 py-2 text-sm text-navy-900 placeholder:text-navy-400 focus:border-gold-400 focus:outline-none" />
      </div>

      <AdminTable
        columns={[
          { key: "name", label: "Name", render: (r) => r.visibility === "anonymous" ? <em className="text-navy-400">Anonymous</em> : <span className="font-medium text-navy-900">{r.name}</span> },
          { key: "category", label: "Category", render: (r) => r.category ? <Badge>{r.category}</Badge> : "-" },
          { key: "request", label: "Request", render: (r) => <span className="line-clamp-2 max-w-xs">{r.request}</span> },
          { key: "visibility", label: "Visibility", render: (r) => <Badge variant={r.visibility === "public" ? "success" : r.visibility === "anonymous" ? "info" : "default"}>{r.visibility}</Badge> },
          { key: "prayed_for", label: "Prayed For", render: (r) => <Badge variant={r.prayed_for ? "success" : "default"}>{r.prayed_for ? "Yes" : "No"}</Badge> },
          { key: "created_at", label: "Date", render: (r) => formatDate(r.created_at) },
          {
            key: "actions", label: "", className: "w-24",
            render: (r) => (
              <div className="flex items-center gap-1">
                <button onClick={() => handlePrayedFor(r.id, !r.prayed_for)} className={`rounded p-1.5 ${r.prayed_for ? "text-green-500" : "text-navy-400"} hover:bg-navy-50`} title="Toggle prayed for">
                  <Check className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(r.id)} className="rounded p-1.5 text-red-400 hover:bg-red-50" title="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ),
          },
        ]}
        data={requests}
        emptyMessage="No prayer requests yet."
      />

      <Pagination page={page} total={count} perPage={perPage} onPageChange={setPage} />
    </>
  );
}
