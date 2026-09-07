"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Eye, EyeOff, Search } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminTable } from "@/components/admin/admin-table";
import { Pagination } from "@/components/admin/pagination";
import { Badge } from "@/components/admin/admin-form-fields";
import { formatDate } from "@/lib/utils";
import { adminDelete, adminToggleField } from "@/components/admin/admin-actions";
import toast from "react-hot-toast";
import type { BlogPost } from "@/types";

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [categories, setCategories] = useState<string[]>([]);
  const perPage = 20;

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set("search", search);
      if (category !== "all") params.set("category", category);
      if (status !== "all") params.set("status", status);
      const res = await fetch(`/api/admin/blog?${params.toString()}`);
      const data = await res.json();
      setPosts(data.data);
      setCount(data.count);
      if (data.categories?.length) setCategories(data.categories);
    } catch { /* empty */ }
  }, [page, search, category, status]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(post: BlogPost) {
    if (!confirm(`Delete "${post.title}" permanently? This cannot be undone.`)) return;
    try {
      const result = await adminDelete("blog_posts", post.id);
      if (result.error) toast.error(result.error);
      else { toast.success("Deleted"); load(); }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    }
  }

  async function handleToggle(post: BlogPost) {
    try {
      const result = await adminToggleField("blog_posts", post.id, "published", !post.published);
      if (result.error) toast.error(result.error);
      else { toast.success(post.published ? "Unpublished" : "Published"); load(); }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Blog Posts"
        description="Write, publish and manage articles"
        action={
          <Link href="/admin/blog/new" className="flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800">
            <Plus className="h-4 w-4" /> New Post
          </Link>
        }
      />

      {/* ── Filters ── */}
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
          <input
            type="search"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-lg border border-navy-200 py-2 pl-9 pr-3 text-sm text-navy-900 placeholder:text-navy-400 focus:border-gold-400 focus:outline-none"
          />
        </div>
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="rounded-lg border border-navy-200 px-3 py-2 text-sm text-navy-700 focus:border-gold-400 focus:outline-none">
          <option value="all">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="rounded-lg border border-navy-200 px-3 py-2 text-sm text-navy-700 focus:border-gold-400 focus:outline-none">
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <AdminTable
        columns={[
          {
            key: "title", label: "Title",
            render: (p) => (
              <div className="flex items-center gap-3">
                {p.featured_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.featured_image} alt="" className="h-10 w-14 shrink-0 rounded object-cover" />
                ) : (
                  <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded bg-navy-800 text-xs text-gold-400">CLAN</div>
                )}
                <div>
                  <span className="font-medium text-navy-900">{p.title}</span>
                </div>
              </div>
            ),
          },
          { key: "category", label: "Category", render: (p) => p.category ? <Badge>{p.category}</Badge> : "-" },
          { key: "author", label: "Author", render: (p) => p.author || "-" },
          { key: "published_date", label: "Date", render: (p) => formatDate(p.published_date) },
          { key: "featured", label: "Featured", render: (p) => p.featured ? <Badge variant="warning">Featured</Badge> : "-" },
          { key: "published", label: "Status", render: (p) => <Badge variant={p.published ? "success" : "default"}>{p.published ? "Published" : "Draft"}</Badge> },
          {
            key: "actions", label: "", className: "w-40",
            render: (p) => (
              <div className="flex items-center gap-1">
                <button onClick={() => handleToggle(p)} className="rounded p-1.5 text-navy-400 hover:bg-navy-50" title={p.published ? "Unpublish" : "Publish"}>
                  {p.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <Link href={`/admin/blog/${p.id}/edit`} className="rounded p-1.5 text-navy-400 hover:bg-navy-50" title="Edit"><Pencil className="h-4 w-4" /></Link>
                <Link href={`/resources/${p.slug}`} target="_blank" className="rounded p-1.5 text-navy-400 hover:bg-navy-50" title="View"><Eye className="h-4 w-4" /></Link>
                <button onClick={() => handleDelete(p)} className="rounded p-1.5 text-red-400 hover:bg-red-50" title="Delete"><Trash2 className="h-4 w-4" /></button>
              </div>
            ),
          },
        ]}
        data={posts}
        emptyMessage="No blog posts found."
      />

      <Pagination page={page} total={count} perPage={perPage} onPageChange={setPage} />
    </>
  );
}
