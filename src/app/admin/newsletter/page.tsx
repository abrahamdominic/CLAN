"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminTable } from "@/components/admin/admin-table";
import { Pagination } from "@/components/admin/pagination";
import { Badge } from "@/components/admin/admin-form-fields";
import { formatDate } from "@/lib/utils";
import type { NewsletterSubscriber } from "@/types";

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const perPage = 20;

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/newsletter?page=${page}`);
      const data = await res.json();
      setSubscribers(data.data);
      setCount(data.count);
    } catch { /* empty */ }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <AdminPageHeader title="Newsletter Subscribers" description={`${count} total subscribers`} />

      <AdminTable
        columns={[
          { key: "email", label: "Email", render: (s) => <span className="font-medium text-navy-900">{s.email}</span> },
          { key: "active", label: "Status", render: (s) => <Badge variant={s.active ? "success" : "default"}>{s.active ? "Active" : "Inactive"}</Badge> },
          { key: "created_at", label: "Subscribed", render: (s) => formatDate(s.created_at) },
        ]}
        data={subscribers}
        emptyMessage="No subscribers yet."
      />

      <Pagination page={page} total={count} perPage={perPage} onPageChange={setPage} />
    </>
  );
}
