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
import type { Sermon } from "@/types";

export default function AdminSermonsPage() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<Sermon | null>(null);
  const [saving, setSaving] = useState(false);
  const perPage = 20;

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/sermons?page=${page}&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      setSermons(data.data);
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
      category: fd.get("category") || null,
      scripture: fd.get("scripture") || null,
      description: fd.get("description") || null,
      date: fd.get("date") || null,
      video_url: fd.get("video_url") || null,
      audio_url: fd.get("audio_url") || null,
      notes_url: fd.get("notes_url") || null,
      thumbnail_url: fd.get("thumbnail_url") || null,
      tags: fd.get("tags") ? String(fd.get("tags")).split(",").map((t) => t.trim()) : [],
      featured: fd.get("featured") === "on",
      published: fd.get("published") === "on",
    };
    const result = editing
      ? await adminUpdate("sermons", editing.id, data)
      : await adminCreate("sermons", data);
    setSaving(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(editing ? "Sermon updated" : "Sermon created");
      setModal(null);
      setEditing(null);
      load();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this sermon?")) return;
    const result = await adminDelete("sermons", id);
    if (result.error) toast.error(result.error);
    else { toast.success("Deleted"); load(); }
  }

  async function handleToggle(id: string, field: string, value: boolean) {
    const result = await adminToggleField("sermons", id, field, value);
    if (result.error) toast.error(result.error);
    else load();
  }

  return (
    <>
      <AdminPageHeader
        title="Sermons"
        description="Manage sermons and teachings"
        action={
          <button onClick={() => { setEditing(null); setModal("create"); }} className="flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800">
            <Plus className="h-4 w-4" /> Add Sermon
          </button>
        }
      />

      <div className="mb-4">
        <input
          type="search"
          placeholder="Search sermons..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full max-w-sm rounded-lg border border-navy-200 px-4 py-2 text-sm text-navy-900 placeholder:text-navy-400 focus:border-gold-400 focus:outline-none"
        />
      </div>

      <AdminTable
        columns={[
          { key: "title", label: "Title", render: (s) => <span className="font-medium text-navy-900">{s.title}</span> },
          { key: "category", label: "Category", render: (s) => s.category ? <Badge>{s.category}</Badge> : "—" },
          { key: "date", label: "Date", render: (s) => formatDate(s.date) },
          { key: "featured", label: "Featured", render: (s) => s.featured ? <Badge variant="warning">Featured</Badge> : "—" },
          { key: "published", label: "Status", render: (s) => <Badge variant={s.published ? "success" : "default"}>{s.published ? "Published" : "Draft"}</Badge> },
          {
            key: "actions", label: "", className: "w-32",
            render: (s) => (
              <div className="flex items-center gap-1">
                <button onClick={() => handleToggle(s.id, "published", !s.published)} className="rounded p-1.5 text-navy-400 hover:bg-navy-50" title={s.published ? "Unpublish" : "Publish"}>
                  {s.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button onClick={() => { setEditing(s); setModal("edit"); }} className="rounded p-1.5 text-navy-400 hover:bg-navy-50" title="Edit">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(s.id)} className="rounded p-1.5 text-red-400 hover:bg-red-50" title="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ),
          },
        ]}
        data={sermons}
        emptyMessage="No sermons found. Create your first sermon."
      />

      <Pagination page={page} total={count} perPage={perPage} onPageChange={setPage} />

      <Modal open={!!modal} onClose={() => { setModal(null); setEditing(null); }} title={editing ? "Edit Sermon" : "New Sermon"} wide>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Title" name="title" required defaultValue={editing?.title} placeholder="Sermon title" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category" name="category" defaultValue={editing?.category ?? ""} placeholder="e.g. Faith, Prayer" />
            <Field label="Scripture" name="scripture" defaultValue={editing?.scripture ?? ""} placeholder="e.g. John 3:3" />
          </div>
          <Field label="Description" name="description" textarea defaultValue={editing?.description ?? ""} placeholder="Brief description" />
          <Field label="Date" name="date" type="date" defaultValue={editing?.date?.slice(0, 10)} />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Video URL" name="video_url" defaultValue={editing?.video_url ?? ""} placeholder="https://..." />
            <Field label="Audio URL" name="audio_url" defaultValue={editing?.audio_url ?? ""} placeholder="https://..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Notes URL" name="notes_url" defaultValue={editing?.notes_url ?? ""} placeholder="https://..." />
            <Field label="Thumbnail URL" name="thumbnail_url" defaultValue={editing?.thumbnail_url ?? ""} placeholder="https://..." />
          </div>
          <Field label="Tags" name="tags" defaultValue={editing?.tags?.join(", ") ?? ""} placeholder="comma-separated tags" description="Separate tags with commas" />
          <div className="flex gap-6">
            <CheckboxField label="Featured" name="featured" defaultChecked={editing?.featured} />
            <CheckboxField label="Published" name="published" defaultChecked={editing?.published ?? true} />
          </div>
          <FormActions onCancel={() => { setModal(null); setEditing(null); }} saving={saving} />
        </form>
      </Modal>
    </>
  );
}
