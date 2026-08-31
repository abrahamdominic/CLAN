"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminTable } from "@/components/admin/admin-table";
import { Pagination } from "@/components/admin/pagination";
import { Modal } from "@/components/admin/modal";
import { Field, CheckboxField, FormActions, Badge } from "@/components/admin/admin-form-fields";
import { adminCreate, adminUpdate, adminDelete, adminToggleField } from "@/components/admin/admin-actions";
import toast from "react-hot-toast";
import type { DiscipleshipProgram } from "@/types";

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState<DiscipleshipProgram[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<DiscipleshipProgram | null>(null);
  const [saving, setSaving] = useState(false);
  const perPage = 20;

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/programs?page=${page}`);
      const data = await res.json();
      setPrograms(data.data);
      setCount(data.count);
    } catch { /* empty */ }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {
      title: fd.get("title"),
      description: fd.get("description") || null,
      duration: fd.get("duration") || null,
      schedule: fd.get("schedule") || null,
      image_url: fd.get("image_url") || null,
      featured: fd.get("featured") === "on",
      published: fd.get("published") === "on",
    };
    const result = editing
      ? await adminUpdate("discipleship_programs", editing.id, data)
      : await adminCreate("discipleship_programs", data);
    setSaving(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success(editing ? "Program updated" : "Program created");
      setModal(null); setEditing(null); load();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this program?")) return;
    const result = await adminDelete("discipleship_programs", id);
    if (result.error) toast.error(result.error);
    else { toast.success("Deleted"); load(); }
  }

  return (
    <>
      <AdminPageHeader
        title="Discipleship Programs"
        description="Manage discipleship programs and classes"
        action={
          <button onClick={() => { setEditing(null); setModal("create"); }} className="flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800">
            <Plus className="h-4 w-4" /> Add Program
          </button>
        }
      />

      <AdminTable
        columns={[
          { key: "title", label: "Title", render: (p) => <span className="font-medium text-navy-900">{p.title}</span> },
          { key: "duration", label: "Duration" },
          { key: "schedule", label: "Schedule" },
          { key: "featured", label: "Featured", render: (p) => p.featured ? <Badge variant="warning">Featured</Badge> : "—" },
          { key: "published", label: "Status", render: (p) => <Badge variant={p.published ? "success" : "default"}>{p.published ? "Published" : "Draft"}</Badge> },
          {
            key: "actions", label: "", className: "w-32",
            render: (p) => (
              <div className="flex items-center gap-1">
                <button onClick={() => adminToggleField("discipleship_programs", p.id, "published", !p.published).then(load)} className="rounded p-1.5 text-navy-400 hover:bg-navy-50">
                  {p.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button onClick={() => { setEditing(p); setModal("edit"); }} className="rounded p-1.5 text-navy-400 hover:bg-navy-50"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(p.id)} className="rounded p-1.5 text-red-400 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
              </div>
            ),
          },
        ]}
        data={programs}
        emptyMessage="No programs found."
      />

      <Pagination page={page} total={count} perPage={perPage} onPageChange={setPage} />

      <Modal open={!!modal} onClose={() => { setModal(null); setEditing(null); }} title={editing ? "Edit Program" : "New Program"} wide>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Title" name="title" required defaultValue={editing?.title} />
          <Field label="Description" name="description" textarea defaultValue={editing?.description ?? ""} />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Duration" name="duration" defaultValue={editing?.duration ?? ""} placeholder="e.g. 8 Weeks" />
            <Field label="Schedule" name="schedule" defaultValue={editing?.schedule ?? ""} placeholder="e.g. Saturdays, 10:00 AM" />
          </div>
          <Field label="Image URL" name="image_url" defaultValue={editing?.image_url ?? ""} />
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
