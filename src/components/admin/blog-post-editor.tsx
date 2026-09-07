"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Save, Eye, UploadCloud, X, ImagePlus, Clipboard, Check, User, Calendar,
} from "lucide-react";
import { Badge } from "@/components/admin/admin-form-fields";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { uploadBlogImage, adminCreate, adminUpdate, adminDelete } from "@/components/admin/admin-actions";
import { sanitizeHtmlContent } from "@/lib/sanitize";
import { slugify, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import type { BlogPost } from "@/types";

const BLOG_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const BLOG_IMAGE_MAX = 5 * 1024 * 1024;

interface BlogPostEditorProps {
  post: BlogPost | null;
}

export function BlogPostEditor({ post }: BlogPostEditorProps) {
  const router = useRouter();
  const isEdit = Boolean(post);

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [author, setAuthor] = useState(post?.author ?? "");
  const [category, setCategory] = useState(post?.category ?? "");
  const [tags, setTags] = useState(post?.tags?.join(", ") ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [seoTitle, setSeoTitle] = useState(post?.seo_title ?? "");
  const [seoDesc, setSeoDesc] = useState(post?.seo_description ?? "");
  const [featured, setFeatured] = useState(post?.featured ?? false);
  const [published, setPublished] = useState(post?.published ?? true);
  const [publishedDate, setPublishedDate] = useState(
    post?.published_date ? post.published_date.slice(0, 16) : new Date().toISOString().slice(0, 16),
  );

  const [featuredImage, setFeaturedImage] = useState<string | null>(post?.featured_image ?? null);
  const [featuredFile, setFeaturedFile] = useState<File | null>(null);
  const [featuredDrag, setFeaturedDrag] = useState(false);

  const [saving, setSaving] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [dirty, setDirty] = useState(false);

  /* ── Dirty tracking / beforeunload ── */
  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (dirty) { e.preventDefault(); e.returnValue = ""; }
    }
    if (dirty) window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  /* ── Slug autogeneration from title ── */
  useEffect(() => {
    if (!slugTouched && !isEdit) setSlug(slugify(title));
  }, [title, slugTouched, isEdit]);

  /* ── Featured image handlers ── */
  function onFeaturedFile(file: File | null) {
    if (!file) return;
    if (!BLOG_IMAGE_TYPES.includes(file.type)) { toast.error("Only JPG, PNG or WebP images are allowed"); return; }
    if (file.size > BLOG_IMAGE_MAX) { toast.error("Image too large (max 5MB)"); return; }
    setFeaturedFile(file);
    setFeaturedImage(URL.createObjectURL(file));
    setDirty(true);
  }

  async function uploadFeatured(): Promise<string | null> {
    if (!featuredFile) return featuredImage;
    const fd = new FormData();
    fd.append("file", featuredFile);
    const result = await uploadBlogImage(fd);
    if (result.error) throw new Error(result.error);
    setFeaturedFile(null);
    setFeaturedImage(result.url ?? null);
    return result.url ?? null;
  }

  /* ── Save ── */
  async function handleSave(publish: boolean) {
    if (!title.trim()) { toast.error("Please add a title"); return; }
    setSaving("save");

    let finalImage = featuredImage;
    try { finalImage = await uploadFeatured(); }
    catch (err) { toast.error((err as Error).message); setSaving(null); return; }

    const data: Record<string, unknown> = {
      title: title.trim(),
      slug: slug.trim() || slugify(title),
      author: author.trim() || null,
      category: category.trim() || null,
      tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      content: sanitizeHtmlContent(content),
      featured_image: finalImage,
      seo_title: seoTitle.trim() || null,
      seo_description: seoDesc.trim() || null,
      featured,
      published: publish,
      published_date: publishedDate ? new Date(publishedDate).toISOString() : new Date().toISOString(),
    };

    const result = isEdit
      ? await adminUpdate("blog_posts", post!.id, data)
      : await adminCreate("blog_posts", data);
    setSaving(null);

    if (result.error) { toast.error(result.error); return; }
    setPublished(publish);
    setDirty(false);
    toast.success(publish ? (isEdit ? "Post updated and published" : "Post published") : "Draft saved");
    router.refresh();
  }

  /* ── Delete ── */
  async function handleDelete() {
    if (!post) return;
    if (!confirm("Delete this post permanently? This cannot be undone.")) return;
    const result = await adminDelete("blog_posts", post.id);
    if (result.error) { toast.error(result.error); return; }
    toast.success("Post deleted");
    router.push("/admin/blog");
  }

  /* ── Preview ── */
  if (previewOpen) {
    const previewPost = {
      title, category, author, published_date: publishedDate ? new Date(publishedDate).toISOString() : null,
      content: sanitizeHtmlContent(content),
    };
    return (
      <div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <button onClick={() => setPreviewOpen(false)} className="flex items-center gap-2 rounded-lg border border-navy-200 px-4 py-2 text-sm font-medium text-navy-700 hover:bg-navy-50">
            <ArrowLeft className="h-4 w-4" /> Back to editor
          </button>
          <div className="flex items-center gap-2">
            <Badge variant="info">Preview</Badge>
            <span className="text-sm text-navy-400">{title ? `"${title}"` : "Untitled"}</span>
          </div>
        </div>

        <section className="overflow-hidden rounded-xl border border-navy-100 shadow-sm">
          <div className="bg-navy-900 px-6 py-12 text-white sm:px-12">
            <div className="mx-auto max-w-3xl">
              {category && <p className="text-sm font-semibold uppercase tracking-widest text-gold-400">{category}</p>}
              <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">{title || "Untitled"}</h1>
              <div className="mt-6 flex flex-wrap items-center gap-5 text-navy-200">
                {author && <span className="flex items-center gap-2 text-sm"><UserIcon /> {author}</span>}
                {previewPost.published_date && (
                  <span className="flex items-center gap-2 text-sm"><CalendarIcon /> {formatDate(previewPost.published_date)}</span>
                )}
              </div>
            </div>
          </div>
          <div className="px-6 py-12 sm:px-12">
            <div className="mx-auto max-w-3xl">
              {featuredImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={featuredImage} alt={title || ""} className="mb-8 w-full rounded-lg" />
              )}
              <article className="prose-content">
                <div dangerouslySetInnerHTML={{ __html: previewPost.content }} />
              </article>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const seoTitleLen = seoTitle.length;
  const seoDescLen = seoDesc.length;

  return (
    <div>
      {/* ── Header actions ── */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => { if (!dirty || confirm("Discard unsaved changes?")) router.push("/admin/blog"); }} className="rounded-lg border border-navy-200 p-2 text-navy-500 hover:bg-navy-50">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold text-navy-900">
              {isEdit ? "Edit Post" : "New Post"}
            </h1>
            <p className="text-sm text-navy-500">
              {dirty ? <span className="text-amber-600 font-medium">● Unsaved changes</span> : <span>All changes saved</span>}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setPreviewOpen(true)} className="flex items-center gap-2 rounded-lg border border-navy-200 px-4 py-2 text-sm font-semibold text-navy-700 hover:bg-navy-50">
            <Eye className="h-4 w-4" /> Preview
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={saving !== null}
            className="flex items-center gap-2 rounded-lg border border-navy-300 px-4 py-2 text-sm font-semibold text-navy-700 hover:bg-navy-100 disabled:opacity-60"
          >
            <Save className="h-4 w-4" /> {saving === "save" ? "Saving..." : "Save Draft"}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving !== null}
            className="flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-60"
          >
            {isEdit ? "Update" : "Publish"}
          </button>
          {isEdit && (
            <button onClick={handleDelete} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Main column ── */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-navy-100 bg-white p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-700">Title <span className="text-red-500">*</span></label>
                <input
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); setDirty(true); if (!slugTouched && !isEdit) setSlug(slugify(e.target.value)); }}
                  className="mt-1 w-full rounded-lg border border-navy-200 px-4 py-3 text-xl font-display font-semibold text-navy-900 placeholder:text-navy-300 focus:border-gold-400 focus:outline-none"
                  placeholder="Enter a compelling title..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700">Slug</label>
                <div className="mt-1 flex items-center gap-2 rounded-lg border border-navy-200 px-3 focus-within:border-gold-400">
                  <span className="text-sm text-navy-400">/resources/</span>
                  <input
                    value={slug}
                    onChange={(e) => { setSlug(slugify(e.target.value)); setSlugTouched(true); setDirty(true); }}
                    className="w-full flex-1 border-0 bg-transparent py-2 text-sm text-navy-900 placeholder:text-navy-400 focus:outline-none"
                    placeholder="auto-generated-from-title"
                  />
                </div>
                <p className="mt-1 text-xs text-navy-400">Auto-generated from the title. You can edit it — use lowercase, hyphens.</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-navy-100 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <label className="text-sm font-medium text-navy-700">Content</label>
              <span className="flex items-center gap-1 text-xs text-navy-400"><Clipboard className="h-3 w-3" /> You can paste from Word, Google Docs, Notion, etc.</span>
            </div>
            <RichTextEditor content={content} onChange={(html) => { setContent(html); setDirty(true); }} placeholder="Start writing your article..." />
          </div>
        </div>

        {/* ── Sidebar column ── */}
        <div className="space-y-6">
          {/* Featured image */}
          <div className="rounded-xl border border-navy-100 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-bold text-navy-900">Featured Image</h2>
            {featuredImage ? (
              <div className="mt-4">
                <div className="overflow-hidden rounded-lg border border-navy-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={featuredImage} alt="Featured preview" className="aspect-video w-full object-cover" />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <label className="flex cursor-pointer items-center gap-1 rounded-lg border border-navy-200 px-3 py-1.5 text-xs font-medium text-navy-700 hover:bg-navy-50">
                    <ImagePlus className="h-3.5 w-3.5" /> Replace
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => onFeaturedFile(e.target.files?.[0] ?? null)} />
                  </label>
                  <button onClick={() => { setFeaturedImage(null); setFeaturedFile(null); setDirty(true); }} className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
                    <X className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <>
                <label
                  onDragOver={(e) => { e.preventDefault(); setFeaturedDrag(true); }}
                  onDragLeave={() => setFeaturedDrag(false)}
                  onDrop={(e) => { e.preventDefault(); setFeaturedDrag(false); onFeaturedFile(e.dataTransfer.files?.[0] ?? null); }}
                  className={`mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-10 text-center transition-colors ${featuredDrag ? "border-gold-500 bg-gold-50" : "border-navy-200 hover:border-gold-400 hover:bg-navy-50"}`}
                >
                  <UploadCloud className="h-8 w-8 text-navy-300" />
                  <span className="text-sm font-medium text-navy-600">Drag & drop or click to upload</span>
                  <span className="text-xs text-navy-400">JPG, PNG or WebP · max 5MB</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => onFeaturedFile(e.target.files?.[0] ?? null)} />
                </label>
                <div className="mt-3">
                  <label className="flex items-center gap-1 text-xs font-medium text-navy-600"><Check className="h-3 w-3" /> ...or use an image URL</label>
                  <input
                    value={featuredImage ?? ""}
                    onChange={(e) => { setFeaturedImage(e.target.value || null); setDirty(true); }}
                    className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2 text-xs text-navy-900 placeholder:text-navy-400 focus:border-gold-400 focus:outline-none"
                    placeholder="https://..."
                  />
                </div>
              </>
            )}
          </div>

          {/* Settings */}
          <div className="rounded-xl border border-navy-100 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-bold text-navy-900">Settings</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-700">Category</label>
                <input value={category} onChange={(e) => { setCategory(e.target.value); setDirty(true); }} className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2 text-sm text-navy-900 placeholder:text-navy-400 focus:border-gold-400 focus:outline-none" placeholder="e.g. Prayer, Discipleship" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700">Author</label>
                <input value={author} onChange={(e) => { setAuthor(e.target.value); setDirty(true); }} className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2 text-sm text-navy-900 placeholder:text-navy-400 focus:border-gold-400 focus:outline-none" placeholder="Author name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700">Tags</label>
                <input value={tags} onChange={(e) => { setTags(e.target.value); setDirty(true); }} className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2 text-sm text-navy-900 placeholder:text-navy-400 focus:border-gold-400 focus:outline-none" placeholder="comma-separated" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700">Publish Date</label>
                <input type="datetime-local" value={publishedDate} onChange={(e) => { setPublishedDate(e.target.value); setDirty(true); }} className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2 text-sm text-navy-900 focus:border-gold-400 focus:outline-none" />
              </div>
              <div className="space-y-3 pt-1">
                <label className="flex cursor-pointer items-center justify-between">
                  <span className="text-sm font-medium text-navy-700">Published</span>
                  <button type="button" role="switch" aria-checked={published} onClick={() => { setPublished(!published); setDirty(true); }} className={`relative h-6 w-11 rounded-full transition-colors ${published ? "bg-gold-500" : "bg-navy-200"}`}>
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${published ? "left-[22px]" : "left-0.5"}`} />
                  </button>
                </label>
                <label className="flex cursor-pointer items-center justify-between">
                  <span className="text-sm font-medium text-navy-700">Featured</span>
                  <button type="button" role="switch" aria-checked={featured} onClick={() => { setFeatured(!featured); setDirty(true); }} className={`relative h-6 w-11 rounded-full transition-colors ${featured ? "bg-gold-500" : "bg-navy-200"}`}>
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${featured ? "left-[22px]" : "left-0.5"}`} />
                  </button>
                </label>
              </div>
            </div>
          </div>

          {/* SEO */}
          <div className="rounded-xl border border-navy-100 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-bold text-navy-900">SEO</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-700">SEO Title</label>
                <input value={seoTitle} onChange={(e) => { setSeoTitle(e.target.value); setDirty(true); }} className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2 text-sm text-navy-900 placeholder:text-navy-400 focus:border-gold-400 focus:outline-none" placeholder="Optional — defaults to title" />
                <p className={`mt-1 text-right text-xs ${seoTitleLen > 60 ? "text-amber-600" : "text-navy-400"}`}>{seoTitleLen}/60</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700">Meta Description</label>
                <textarea value={seoDesc} onChange={(e) => { setSeoDesc(e.target.value); setDirty(true); }} rows={3} className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2 text-sm text-navy-900 placeholder:text-navy-400 focus:border-gold-400 focus:outline-none" placeholder="Brief summary shown in search results" />
                <p className={`mt-1 text-right text-xs ${seoDescLen > 160 ? "text-amber-600" : "text-navy-400"}`}>{seoDescLen}/160</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserIcon() {
  return <User className="h-5 w-5 text-gold-400" />;
}
function CalendarIcon() {
  return <Calendar className="h-5 w-5 text-gold-400" />;
}
