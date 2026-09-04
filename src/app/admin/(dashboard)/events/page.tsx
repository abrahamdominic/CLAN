"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminTable } from "@/components/admin/admin-table";
import { Pagination } from "@/components/admin/pagination";
import { Modal } from "@/components/admin/modal";
import { Field, CheckboxField, FormActions, Badge } from "@/components/admin/admin-form-fields";
import { formatDate } from "@/lib/utils";
import { adminCreate, adminUpdate, adminDelete, adminToggleField } from "@/components/admin/admin-actions";
import toast from "react-hot-toast";
import type { Event } from "@/types";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<Event | null>(null);
  const [saving, setSaving] = useState(false);
  const perPage = 20;

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/events?page=${page}&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      setEvents(data.data);
      setCount(data.count);
    } catch { /* empty */ }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {
      title: fd.get("title"),
      slug: fd.get("slug") || undefined,
      description: fd.get("description") || null,
      date: fd.get("date"),
      time: fd.get("time") || null,
      location: fd.get("location") || null,
      is_online: fd.get("is_online") === "on",
      online_link: fd.get("online_link") || null,
      speaker: fd.get("speaker") || null,
      image_url: fd.get("image_url") || null,
      registration_link: fd.get("registration_link") || null,
      category: fd.get("category") || null,
      published: fd.get("published") === "on",
    };
    const result = editing
      ? await adminUpdate("events", editing.id, data)
      : await adminCreate("events", data);
    setSaving(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success(editing ? "Event updated" : "Event created");
      setModal(null); setEditing(null); load();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this event?")) return;
    const result = await adminDelete("events", id);
    if (result.error) toast.error(result.error);
    else { toast.success("Deleted"); load(); }
  }

  async function handleToggle(id: string, field: string, value: boolean) {
    const result = await adminToggleField("events", id, field, value);
    if (result.error) toast.error(result.error);
    else load();
  }

  return (
    <>
      <AdminPageHeader
        title="Events"
        description="Manage events and gatherings"
        action={
          <button onClick={() => { setEditing(null); setModal("create"); }} className="flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800">
            <Plus className="h-4 w-4" /> Add Event
          </button>
        }
      />

      <div className="mb-4">
        <input type="search" placeholder="Search events..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-full max-w-sm rounded-lg border border-navy-200 px-4 py-2 text-sm text-navy-900 placeholder:text-navy-400 focus:border-gold-400 focus:outline-none" />
      </div>

      <AdminTable
        columns={[
          { key: "title", label: "Title", render: (e) => <span className="font-medium text-navy-900">{e.title}</span> },
          { key: "date", label: "Date", render: (e) => formatDate(e.date) },
          { key: "category", label: "Category", render: (e) => e.category ? <Badge>{e.category}</Badge> : "-" },
          { key: "is_online", label: "Type", render: (e) => <Badge variant={e.is_online ? "info" : "default"}>{e.is_online ? "Online" : "In-Person"}</Badge> },
          { key: "published", label: "Status", render: (e) => <Badge variant={e.published ? "success" : "default"}>{e.published ? "Published" : "Draft"}</Badge> },
          {
            key: "actions", label: "", className: "w-32",
            render: (e) => (
              <div className="flex items-center gap-1">
                <button onClick={() => handleToggle(e.id, "published", !e.published)} className="rounded p-1.5 text-navy-400 hover:bg-navy-50">
                  {e.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button onClick={() => { setEditing(e); setModal("edit"); }} className="rounded p-1.5 text-navy-400 hover:bg-navy-50"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(e.id)} className="rounded p-1.5 text-red-400 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
              </div>
            ),
          },
        ]}
        data={events}
        emptyMessage="No events found."
      />

      <Pagination page={page} total={count} perPage={perPage} onPageChange={setPage} />

      <Modal open={!!modal} onClose={() => { setModal(null); setEditing(null); }} title={editing ? "Edit Event" : "New Event"} wide>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Title" name="title" required defaultValue={editing?.title} placeholder="Event title" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Date" name="date" type="date" required defaultValue={editing?.date?.slice(0, 10)} />
            <Field label="Time" name="time" defaultValue={editing?.time ?? ""} placeholder="18:00" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Location" name="location" defaultValue={editing?.location ?? ""} placeholder="Venue" />
            <Field label="Category" name="category" defaultValue={editing?.category ?? ""} placeholder="e.g. Prayer Meeting" />
          </div>
          <Field label="Description" name="description" textarea defaultValue={editing?.description ?? ""} />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Speaker" name="speaker" defaultValue={editing?.speaker ?? ""} />
            <Field label="Registration Link" name="registration_link" defaultValue={editing?.registration_link ?? ""} placeholder="https://..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Image URL" name="image_url" defaultValue={editing?.image_url ?? ""} />
            <Field label="Online Link" name="online_link" defaultValue={editing?.online_link ?? ""} placeholder="https://..." />
          </div>
          <div className="flex gap-6">
            <CheckboxField label="Online Event" name="is_online" defaultChecked={editing?.is_online} />
            <CheckboxField label="Published" name="published" defaultChecked={editing?.published ?? true} />
          </div>
          <FormActions onCancel={() => { setModal(null); setEditing(null); }} saving={saving} />
        </form>
      </Modal>
    </>
  );
}
