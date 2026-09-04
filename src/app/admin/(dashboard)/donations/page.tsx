"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminTable } from "@/components/admin/admin-table";
import { Pagination } from "@/components/admin/pagination";
import { Badge } from "@/components/admin/admin-form-fields";
import { formatDate } from "@/lib/utils";
import type { Donation } from "@/types";

export default function AdminDonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const perPage = 20;

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/donations?page=${page}`);
      const data = await res.json();
      setDonations(data.data);
      setCount(data.count);
    } catch { /* empty */ }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const total = donations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  return (
    <>
      <AdminPageHeader
        title="Donations"
        description="View donation records"
        action={
          <div className="rounded-lg border border-navy-200 bg-white px-4 py-2 text-sm">
            <span className="text-navy-500">Page Total:</span>{" "}
            <span className="font-bold text-navy-900">${total.toLocaleString()}</span>
          </div>
        }
      />

      <AdminTable
        columns={[
          { key: "donor_name", label: "Donor", render: (d) => <span className="font-medium text-navy-900">{d.donor_name || "Anonymous"}</span> },
          { key: "donor_email", label: "Email" },
          { key: "amount", label: "Amount", render: (d) => <span className="font-semibold text-navy-900">${Number(d.amount).toLocaleString()}</span> },
          { key: "category", label: "Category", render: (d) => d.category ? <Badge>{d.category}</Badge> : "-" },
          { key: "status", label: "Status", render: (d) => <Badge variant={d.status === "completed" ? "success" : "default"}>{d.status || "recorded"}</Badge> },
          { key: "created_at", label: "Date", render: (d) => formatDate(d.created_at) },
        ]}
        data={donations}
        emptyMessage="No donations recorded yet."
      />

      <Pagination page={page} total={count} perPage={perPage} onPageChange={setPage} />
    </>
  );
}
