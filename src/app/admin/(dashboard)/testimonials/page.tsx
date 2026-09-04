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
import type { Testimonial } from "@/types";

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const perPage = 20;

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/testimonials?page=${page}`);
      const data = await res.json();
      setTestimonials(data.data);
      setCount(data.count);
    } catch { /* empty */ }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this testimony?")) return;
    const result = await adminDelete("testimonials", id);
    if (result.error) toast.error(result.error);
    else { toast.success("Deleted"); load(); }
  }

  async function handleApprove(id: string, approved: boolean) {
    const result = await adminToggleField("testimonials", id, "approved", approved);
    if (result.error) toast.error(result.error);
    else { toast.success(approved ? "Approved" : "Unapproved"); load(); }
  }

  return (
    <>
      <AdminPageHeader title="Testimonials" description="Review and approve submitted testimonies" />

      <AdminTable
        columns={[
          { key: "name", label: "Name", render: (t) => <span className="font-medium text-navy-900">{t.name}</span> },
          { key: "testimony", label: "Testimony", render: (t) => <span className="line-clamp-2 max-w-md">{t.testimony}</span> },
          { key: "approved", label: "Status", render: (t) => <Badge variant={t.approved ? "success" : "warning"}>{t.approved ? "Approved" : "Pending"}</Badge> },
          { key: "created_at", label: "Date", render: (t) => formatDate(t.created_at) },
          {
            key: "actions", label: "", className: "w-24",
            render: (t) => (
              <div className="flex items-center gap-1">
                <button onClick={() => handleApprove(t.id, !t.approved)} className={`rounded p-1.5 ${t.approved ? "text-green-500" : "text-navy-400"} hover:bg-navy-50`} title={t.approved ? "Unapprove" : "Approve"}>
                  <Check className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(t.id)} className="rounded p-1.5 text-red-400 hover:bg-red-50" title="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ),
          },
        ]}
        data={testimonials}
        emptyMessage="No testimonials submitted yet."
      />

      <Pagination page={page} total={count} perPage={perPage} onPageChange={setPage} />
    </>
  );
}
