"use client";

import { useState, useEffect, useCallback } from "react";
import { Download, RefreshCw } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminTable } from "@/components/admin/admin-table";
import { Pagination } from "@/components/admin/pagination";
import { Badge } from "@/components/admin/admin-form-fields";
import { formatDate, formatDateTime } from "@/lib/utils";
import toast from "react-hot-toast";
import type { NewsletterSubscriber } from "@/types";

type StatusFilter = "all" | "active" | "inactive";

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [loadedCount, setLoadedCount] = useState(false);
  const perPage = 20;

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set("search", search);
      if (status !== "all") params.set("status", status);
      const res = await fetch(`/api/admin/newsletter?${params.toString()}`);
      const data = await res.json();
      setSubscribers(data.data);
      setCount(data.count);
      setLoadedCount(true);
    } catch { /* empty */ }
  }, [page, search, status]);

  useEffect(() => { load(); }, [load]);

  async function handleExport() {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (status !== "all") params.set("status", status);
      const res = await fetch(`/api/admin/newsletter/export?${params.toString()}`, {
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
      a.download = match?.[1] || `clan-newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Subscribers exported");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    }
  }

  async function handleResend(id: string) {
    try {
      const res = await fetch("/api/admin/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.error) toast.error(data.error);
      else toast.success(data.emailSent ? "Confirmation email sent" : "Confirmation regenerated (email not configured)");
    } catch {
      toast.error("Failed to resend confirmation");
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Newsletter Subscribers"
        description={loadedCount ? `${count} total subscribers` : "Loading subscribers..."}
        action={
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy-800"
          >
            <Download className="h-4 w-4" />
            Export Subscribers CSV
          </button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full max-w-sm rounded-lg border border-navy-200 px-4 py-2 text-sm text-navy-900 placeholder:text-navy-400 focus:border-gold-400 focus:outline-none"
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value as StatusFilter); setPage(1); }}
          className="w-full max-w-[160px] rounded-lg border border-navy-200 px-3 py-2 text-sm text-navy-700 focus:border-gold-400 focus:outline-none"
          aria-label="Filter by status"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <AdminTable
        columns={[
          { key: "name", label: "Name", render: (s) => <span className="font-medium text-navy-900">{s.name || "-"}</span> },
          { key: "email", label: "Email", render: (s) => <span className="text-navy-700">{s.email}</span> },
          { key: "phone_number", label: "Phone", render: (s) => <span className="text-navy-600">{s.phone_number || "-"}</span> },
          { key: "active", label: "Status", render: (s) => <Badge variant={s.active ? "success" : "default"}>{s.active ? "Active" : "Inactive"}</Badge> },
          { key: "confirmed_at", label: "Confirmed", render: (s) => (s.confirmed_at ? formatDate(s.confirmed_at) : "-") },
          { key: "created_at", label: "Subscribed", render: (s) => formatDateTime(s.created_at) },
          {
            key: "actions",
            label: "",
            className: "w-40",
            render: (s) =>
              !s.active ? (
                <button
                  onClick={() => handleResend(s.id)}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-navy-600 hover:bg-navy-50"
                  title="Resend confirmation email"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Resend
                </button>
              ) : null,
          },
        ]}
        data={subscribers}
        emptyMessage="No subscribers found."
      />

      <Pagination page={page} total={count} perPage={perPage} onPageChange={setPage} />
    </>
  );
}