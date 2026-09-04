"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Modal } from "@/components/admin/modal";
import { Field, FormActions } from "@/components/admin/admin-form-fields";
import { adminCreate, adminUpdate, adminDelete } from "@/components/admin/admin-actions";
import toast from "react-hot-toast";
import type { Speaker } from "@/types";

export default function AdminSpeakersPage() {
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<Speaker | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/speakers");
      const data = await res.json();
      setSpeakers(data.data);
    } catch { /* empty */ }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {
      name: fd.get("name"),
      photo_url: fd.get("photo_url") || null,
      bio: fd.get("bio") || null,
    };
    const result = editing
      ? await adminUpdate("speakers", editing.id, data)
      : await adminCreate("speakers", data);
    setSaving(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success(editing ? "Speaker updated" : "Speaker created");
      setModal(null); setEditing(null); load();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this speaker?")) return;
    const result = await adminDelete("speakers", id);
    if (result.error) toast.error(result.error);
    else { toast.success("Deleted"); load(); }
  }

  return (
    <>
      <AdminPageHeader
        title="Speakers"
        description="Manage sermon speakers"
        action={
          <button onClick={() => { setEditing(null); setModal("create"); }} className="flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800">
            <Plus className="h-4 w-4" /> Add Speaker
          </button>
        }
      />

      {speakers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-navy-200 bg-white p-12 text-center">
          <p className="text-sm text-navy-400">No speakers yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {speakers.map((s) => (
            <div key={s.id} className="flex items-center gap-4 rounded-xl border border-navy-100 bg-white p-4 shadow-sm">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy-100 text-lg font-bold text-navy-600">
                {s.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-medium text-navy-900">{s.name}</p>
                {s.bio && <p className="mt-0.5 line-clamp-1 text-xs text-navy-500">{s.bio}</p>}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => { setEditing(s); setModal("edit"); }} className="rounded p-1.5 text-navy-400 hover:bg-navy-50"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(s.id)} className="rounded p-1.5 text-red-400 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!modal} onClose={() => { setModal(null); setEditing(null); }} title={editing ? "Edit Speaker" : "New Speaker"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Name" name="name" required defaultValue={editing?.name} />
          <Field label="Photo URL" name="photo_url" defaultValue={editing?.photo_url ?? ""} />
          <Field label="Bio" name="bio" textarea defaultValue={editing?.bio ?? ""} />
          <FormActions onCancel={() => { setModal(null); setEditing(null); }} saving={saving} />
        </form>
      </Modal>
    </>
  );
}
