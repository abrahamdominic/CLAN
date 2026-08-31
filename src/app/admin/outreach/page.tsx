"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminTable } from "@/components/admin/admin-table";
import { Pagination } from "@/components/admin/pagination";
import { Modal } from "@/components/admin/modal";
import { Field, CheckboxField, SelectField, FormActions, Badge } from "@/components/admin/admin-form-fields";
import { adminCreate, adminUpdate, adminDelete, adminToggleField } from "@/components/admin/admin-actions";
import toast from "react-hot-toast";
import type { OutreachProject } from "@/types";

export default function AdminOutreachPage() {
  const [projects, setProjects] = useState<OutreachProject[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<OutreachProject | null>(null);
  const [saving, setSaving] = useState(false);
  const perPage = 20;

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/outreach?page=${page}`);
      const data = await res.json();
      setProjects(data.data);
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
      location: fd.get("location") || null,
      date: fd.get("date") || null,
      image_url: fd.get("image_url") || null,
      status: fd.get("status"),
      published: fd.get("published") === "on",
    };
    const result = editing
      ? await adminUpdate("outreach_projects", editing.id, data)
      : await adminCreate("outreach_projects", data);
    setSaving(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success(editing ? "Project updated" : "Project created");
      setModal(null); setEditing(null); load();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this project?")) return;
    const result = await adminDelete("outreach_projects", id);
    if (result.error) toast.error(result.error);
    else { toast.success("Deleted"); load(); }
  }

  const statusVariant = (s: string) => s === "current" ? "success" : s === "upcoming" ? "info" : "default";

  return (
    <>
      <AdminPageHeader
        title="Outreach Projects"
        description="Manage community outreach initiatives"
        action={
          <button onClick={() => { setEditing(null); setModal("create"); }} className="flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800">
            <Plus className="h-4 w-4" /> Add Project
          </button>
        }
      />

      <AdminTable
        columns={[
          { key: "title", label: "Title", render: (p) => <span className="font-medium text-navy-900">{p.title}</span> },
          { key: "location", label: "Location" },
          { key: "status", label: "Status", render: (p) => <Badge variant={statusVariant(p.status)}>{p.status}</Badge> },
          { key: "published", label: "Visibility", render: (p) => <Badge variant={p.published ? "success" : "default"}>{p.published ? "Published" : "Draft"}</Badge> },
          {
            key: "actions", label: "", className: "w-32",
            render: (p) => (
              <div className="flex items-center gap-1">
                <button onClick={() => adminToggleField("outreach_projects", p.id, "published", !p.published).then(load)} className="rounded p-1.5 text-navy-400 hover:bg-navy-50">
                  {p.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button onClick={() => { setEditing(p); setModal("edit"); }} className="rounded p-1.5 text-navy-400 hover:bg-navy-50"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(p.id)} className="rounded p-1.5 text-red-400 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
              </div>
            ),
          },
        ]}
        data={projects}
        emptyMessage="No outreach projects found."
      />

      <Pagination page={page} total={count} perPage={perPage} onPageChange={setPage} />

      <Modal open={!!modal} onClose={() => { setModal(null); setEditing(null); }} title={editing ? "Edit Project" : "New Project"} wide>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Title" name="title" required defaultValue={editing?.title} />
          <Field label="Description" name="description" textarea defaultValue={editing?.description ?? ""} />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Location" name="location" defaultValue={editing?.location ?? ""} />
            <Field label="Date" name="date" type="date" defaultValue={editing?.date?.slice(0, 10)} />
          </div>
          <Field label="Image URL" name="image_url" defaultValue={editing?.image_url ?? ""} />
          <SelectField label="Status" name="status" defaultValue={editing?.status ?? "upcoming"} options={[
            { value: "upcoming", label: "Upcoming" },
            { value: "current", label: "Current" },
            { value: "past", label: "Past" },
          ]} />
          <CheckboxField label="Published" name="published" defaultChecked={editing?.published ?? true} />
          <FormActions onCancel={() => { setModal(null); setEditing(null); }} saving={saving} />
        </form>
      </Modal>
    </>
  );
}
