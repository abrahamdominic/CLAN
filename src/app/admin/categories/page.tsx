"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Modal } from "@/components/admin/modal";
import { Field, SelectField, FormActions, Badge } from "@/components/admin/admin-form-fields";
import { adminCreate, adminUpdate, adminDelete } from "@/components/admin/admin-actions";
import toast from "react-hot-toast";
import type { Category } from "@/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      setCategories(data.data);
    } catch { /* empty */ }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {
      name: fd.get("name"),
      type: fd.get("type"),
    };
    const result = editing
      ? await adminUpdate("categories", editing.id, data)
      : await adminCreate("categories", data);
    setSaving(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success(editing ? "Category updated" : "Category created");
      setModal(null); setEditing(null); load();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category?")) return;
    const result = await adminDelete("categories", id);
    if (result.error) toast.error(result.error);
    else { toast.success("Deleted"); load(); }
  }

  const typeColor = (t: string) => t === "sermon" ? "info" : t === "blog" ? "success" : t === "event" ? "warning" : "default";

  return (
    <>
      <AdminPageHeader
        title="Categories"
        description="Manage content categories"
        action={
          <button onClick={() => { setEditing(null); setModal("create"); }} className="flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800">
            <Plus className="h-4 w-4" /> Add Category
          </button>
        }
      />

      {categories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-navy-200 bg-white p-12 text-center">
          <p className="text-sm text-navy-400">No categories yet.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-xl border border-navy-100 bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="font-medium text-navy-900">{c.name}</span>
                <Badge variant={typeColor(c.type) as "info" | "success" | "warning" | "default"}>{c.type}</Badge>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => { setEditing(c); setModal("edit"); }} className="rounded p-1.5 text-navy-400 hover:bg-navy-50"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(c.id)} className="rounded p-1.5 text-red-400 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!modal} onClose={() => { setModal(null); setEditing(null); }} title={editing ? "Edit Category" : "New Category"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Name" name="name" required defaultValue={editing?.name} />
          <SelectField label="Type" name="type" required defaultValue={editing?.type ?? "resource"} options={[
            { value: "sermon", label: "Sermon" },
            { value: "blog", label: "Blog" },
            { value: "event", label: "Event" },
            { value: "resource", label: "Resource" },
          ]} />
          <FormActions onCancel={() => { setModal(null); setEditing(null); }} saving={saving} />
        </form>
      </Modal>
    </>
  );
}
