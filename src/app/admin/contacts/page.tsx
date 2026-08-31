"use client";

import { useState, useEffect, useCallback } from "react";
import { Trash2, Mail, MailOpen } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminTable } from "@/components/admin/admin-table";
import { Pagination } from "@/components/admin/pagination";
import { Badge } from "@/components/admin/admin-form-fields";
import { formatDate } from "@/lib/utils";
import { adminDelete } from "@/components/admin/admin-actions";
import toast from "react-hot-toast";
import type { ContactMessage } from "@/types";

export default function AdminContactsPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const perPage = 20;

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/contacts?page=${page}`);
      const data = await res.json();
      setMessages(data.data);
      setCount(data.count);
    } catch { /* empty */ }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this message?")) return;
    const result = await adminDelete("contact_messages", id);
    if (result.error) toast.error(result.error);
    else { toast.success("Deleted"); load(); }
  }

  async function handleToggleRead(id: string, read: boolean) {
    try {
      const res = await fetch("/api/admin/contacts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, read }),
      });
      const data = await res.json();
      if (data.error) toast.error(data.error);
      else load();
    } catch { /* empty */ }
  }

  return (
    <>
      <AdminPageHeader title="Contact Messages" description="View messages from the contact form" />

      <AdminTable
        columns={[
          { key: "name", label: "From", render: (m) => <span className="font-medium text-navy-900">{m.name}</span> },
          { key: "email", label: "Email" },
          { key: "subject", label: "Subject", render: (m) => m.subject || "—" },
          { key: "message", label: "Message", render: (m) => <span className="line-clamp-2 max-w-sm">{m.message}</span> },
          { key: "read", label: "Status", render: (m) => <Badge variant={m.read ? "default" : "info"}>{m.read ? "Read" : "New"}</Badge> },
          { key: "created_at", label: "Date", render: (m) => formatDate(m.created_at) },
          {
            key: "actions", label: "", className: "w-24",
            render: (m) => (
              <div className="flex items-center gap-1">
                <button onClick={() => handleToggleRead(m.id, !m.read)} className="rounded p-1.5 text-navy-400 hover:bg-navy-50" title={m.read ? "Mark unread" : "Mark read"}>
                  {m.read ? <MailOpen className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                </button>
                <button onClick={() => handleDelete(m.id)} className="rounded p-1.5 text-red-400 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ),
          },
        ]}
        data={messages}
        emptyMessage="No messages yet."
      />

      <Pagination page={page} total={count} perPage={perPage} onPageChange={setPage} />
    </>
  );
}
