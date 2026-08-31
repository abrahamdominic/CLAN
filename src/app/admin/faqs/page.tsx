"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Modal } from "@/components/admin/modal";
import { Field, CheckboxField, FormActions } from "@/components/admin/admin-form-fields";
import { adminCreate, adminUpdate, adminDelete, adminToggleField } from "@/components/admin/admin-actions";
import toast from "react-hot-toast";
import type { Faq } from "@/types";

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/faqs");
      const data = await res.json();
      setFaqs(data.data);
    } catch { /* empty */ }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {
      question: fd.get("question"),
      answer: fd.get("answer"),
      category: fd.get("category") || null,
      sort_order: Number(fd.get("sort_order") || 0),
      published: fd.get("published") === "on",
    };
    const result = editing
      ? await adminUpdate("faqs", editing.id, data)
      : await adminCreate("faqs", data);
    setSaving(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success(editing ? "FAQ updated" : "FAQ created");
      setModal(null); setEditing(null); load();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this FAQ?")) return;
    const result = await adminDelete("faqs", id);
    if (result.error) toast.error(result.error);
    else { toast.success("Deleted"); load(); }
  }

  return (
    <>
      <AdminPageHeader
        title="FAQs"
        description="Manage frequently asked questions"
        action={
          <button onClick={() => { setEditing(null); setModal("create"); }} className="flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800">
            <Plus className="h-4 w-4" /> Add FAQ
          </button>
        }
      />

      <div className="space-y-3">
        {faqs.length === 0 && (
          <div className="rounded-xl border border-dashed border-navy-200 bg-white p-12 text-center">
            <p className="text-sm text-navy-400">No FAQs yet.</p>
          </div>
        )}
        {faqs.map((faq) => (
          <div key={faq.id} className="flex items-start justify-between rounded-xl border border-navy-100 bg-white p-4 shadow-sm">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-navy-900">{faq.question}</h3>
                {!faq.published && <span className="text-xs text-navy-400">(hidden)</span>}
              </div>
              <p className="mt-1 text-sm text-navy-600">{faq.answer}</p>
            </div>
            <div className="ml-4 flex items-center gap-1">
              <button onClick={() => adminToggleField("faqs", faq.id, "published", !faq.published).then(load)} className="rounded p-1.5 text-navy-400 hover:bg-navy-50">
                {faq.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <button onClick={() => { setEditing(faq); setModal("edit"); }} className="rounded p-1.5 text-navy-400 hover:bg-navy-50"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => handleDelete(faq.id)} className="rounded p-1.5 text-red-400 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={!!modal} onClose={() => { setModal(null); setEditing(null); }} title={editing ? "Edit FAQ" : "New FAQ"} wide>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Question" name="question" required defaultValue={editing?.question} />
          <Field label="Answer" name="answer" textarea required defaultValue={editing?.answer} />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category" name="category" defaultValue={editing?.category ?? ""} placeholder="Optional" />
            <Field label="Sort Order" name="sort_order" type="number" defaultValue={editing?.sort_order ?? 0} />
          </div>
          <CheckboxField label="Published" name="published" defaultChecked={editing?.published ?? true} />
          <FormActions onCancel={() => { setModal(null); setEditing(null); }} saving={saving} />
        </form>
      </Modal>
    </>
  );
}
