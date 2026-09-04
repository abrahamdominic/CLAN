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
import type { BlogPost } from "@/types";

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);
  const perPage = 20;

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/blog?page=${page}&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      setPosts(data.data);
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
      author: fd.get("author") || null,
      content: fd.get("content") || "",
      category: fd.get("category") || null,
      tags: fd.get("tags") ? String(fd.get("tags")).split(",").map((t) => t.trim()) : [],
      featured_image: fd.get("featured_image") || null,
      seo_title: fd.get("seo_title") || null,
      seo_description: fd.get("seo_description") || null,
      published_date: editing?.published_date || new Date().toISOString(),
      featured: fd.get("featured") === "on",
      published: fd.get("published") === "on",
    };
    const result = editing
      ? await adminUpdate("blog_posts", editing.id, data)
      : await adminCreate("blog_posts", data);
    setSaving(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success(editing ? "Post updated" : "Post created");
      setModal(null); setEditing(null); load();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this post?")) return;
    const result = await adminDelete("blog_posts", id);
    if (result.error) toast.error(result.error);
    else { toast.success("Deleted"); load(); }
  }

  async function handleToggle(id: string, field: string, value: boolean) {
    const result = await adminToggleField("blog_posts", id, field, value);
    if (result.error) toast.error(result.error);
    else load();
  }

  return (
    <>
      <AdminPageHeader
        title="Blog Posts"
        description="Manage articles and resources"
        action={
          <button onClick={() => { setEditing(null); setModal("create"); }} className="flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800">
            <Plus className="h-4 w-4" /> New Post
          </button>
        }
      />

      <div className="mb-4">
        <input type="search" placeholder="Search posts..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-full max-w-sm rounded-lg border border-navy-200 px-4 py-2 text-sm text-navy-900 placeholder:text-navy-400 focus:border-gold-400 focus:outline-none" />
      </div>

      <AdminTable
        columns={[
          { key: "title", label: "Title", render: (p) => <span className="font-medium text-navy-900">{p.title}</span> },
          { key: "category", label: "Category", render: (p) => p.category ? <Badge>{p.category}</Badge> : "-" },
          { key: "author", label: "Author", render: (p) => p.author || "-" },
          { key: "published_date", label: "Date", render: (p) => formatDate(p.published_date) },
          { key: "featured", label: "Featured", render: (p) => p.featured ? <Badge variant="warning">Featured</Badge> : "-" },
          { key: "published", label: "Status", render: (p) => <Badge variant={p.published ? "success" : "default"}>{p.published ? "Published" : "Draft"}</Badge> },
          {
            key: "actions", label: "", className: "w-32",
            render: (p) => (
              <div className="flex items-center gap-1">
                <button onClick={() => handleToggle(p.id, "published", !p.published)} className="rounded p-1.5 text-navy-400 hover:bg-navy-50">
                  {p.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button onClick={() => { setEditing(p); setModal("edit"); }} className="rounded p-1.5 text-navy-400 hover:bg-navy-50"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(p.id)} className="rounded p-1.5 text-red-400 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
              </div>
            ),
          },
        ]}
        data={posts}
        emptyMessage="No blog posts found."
      />

      <Pagination page={page} total={count} perPage={perPage} onPageChange={setPage} />

      <Modal open={!!modal} onClose={() => { setModal(null); setEditing(null); }} title={editing ? "Edit Post" : "New Post"} wide>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Title" name="title" required defaultValue={editing?.title} placeholder="Post title" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Author" name="author" defaultValue={editing?.author ?? ""} />
            <Field label="Category" name="category" defaultValue={editing?.category ?? ""} placeholder="e.g. Prayer, Discipleship" />
          </div>
          <Field label="Content" name="content" textarea rows={10} defaultValue={editing?.content ?? ""} placeholder="HTML content" />
          <Field label="Featured Image URL" name="featured_image" defaultValue={editing?.featured_image ?? ""} />
          <Field label="Tags" name="tags" defaultValue={editing?.tags?.join(", ") ?? ""} placeholder="comma-separated" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="SEO Title" name="seo_title" defaultValue={editing?.seo_title ?? ""} />
            <Field label="SEO Description" name="seo_description" defaultValue={editing?.seo_description ?? ""} />
          </div>
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
