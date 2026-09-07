"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Save, Eye, UploadCloud, X, ImagePlus, Clipboard, Check, User, Calendar,
} from "lucide-react";
import { Badge } from "@/components/admin/admin-form-fields";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { uploadBlogImage, adminCreate, adminUpdate, adminDelete } from "@/components/admin/admin-actions";
import { sanitizeHtmlContent } from "@/lib/sanitize";
import { slugify, formatDate, formatDateTime } from "@/lib/utils";
import toast from "react-hot-toast";
import type { BlogPost } from "@/types";

const BLOG_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const BLOG_IMAGE_MAX = 5 * 1024 * 1024;

const AUTOSAVE_DEBOUNCE_MS = 1200;
const DRAFT_PREFIX = "clan-blog-draft";

interface BlogPostEditorProps {
  post: BlogPost | null;
}

function draftKey(id: string | null | undefined): string {
  return `${DRAFT_PREFIX}:${id ?? "new"}`;
}

// Convert a (possibly empty or invalid) datetime-local value to an ISO string
// without ever throwing — a RangeError here used to escape from the keystroke
// mirror effect and crash the admin editor with the generic production error.
function safePublishDateISO(value: string): string {
  if (!value) return new Date().toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

interface AutosavePayload {
  title: string;
  slug: string;
  author: string | null;
  category: string | null;
  tags: string[];
  content: string;
  featured_image: string | null;
  seo_title: string | null;
  seo_description: string | null;
  featured: boolean;
  published: boolean;
  published_date: string;
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
  const [autoSaving, setAutoSaving] = useState(false);
  const [autoSavedAt, setAutoSavedAt] = useState<Date | null>(null);

  /* ── Autosave refs ── */
  const postIdRef = useRef<string | null>(post?.id ?? null);
  const latestDataRef = useRef<AutosavePayload | null>(null);
  const lastSavedRef = useRef<string>("");
  const initialSnapshotRef = useRef<string | null>(null);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autosavingRef = useRef(false);
  const pendingAutosaveRef = useRef(false);
  // Resolves when the currently in-flight autosave write finishes. handleSave
  // awaits this so a Publish click that lands while the first autosave is still
  // creating the row updates that row instead of attempting a second create
  // (which would fail on the unique slug constraint and silently leave the
  // post unpublished).
  const inFlightAutosaveRef = useRef<Promise<void> | null>(null);
  const manualSavingRef = useRef(false);
  const draftRecoveredRef = useRef(false);
  // Reflects the publication status of the row currently persisted in the DB.
  // Autosaves preserve it; only explicit Save Draft / Publish change it. This
  // guarantees a new article can never be auto-published halfway through writing.
  const publishedOnceRef = useRef<boolean>(post?.published ?? false);

  /* ── Build the payload that is sent to the DB / stored as a draft ── */
  const buildPayload = useCallback(
    (image?: string | null, publish?: boolean): AutosavePayload => {
      const img = image === undefined ? featuredImage : image;
      return {
        title: title.trim(),
        slug: slug.trim() || slugify(title),
        author: author.trim() || null,
        category: category.trim() || null,
        tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        content: sanitizeHtmlContent(content),
        featured_image: img && img.startsWith("blob:") ? null : img,
        seo_title: seoTitle.trim() || null,
        seo_description: seoDesc.trim() || null,
        featured,
        published: publish ?? published,
        published_date: safePublishDateISO(publishedDate),
      };
    },
    [title, slug, author, category, tags, content, featuredImage, seoTitle, seoDesc, featured, published, publishedDate],
  );

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

  /* ── Clear the stored draft once a save is confirmed ── */
  const clearLocalDraft = useCallback(() => {
    try {
      localStorage.removeItem(draftKey(postIdRef.current ?? post?.id ?? null));
    } catch { /* ignore */ }
  }, [post?.id]);

  /* ── Move a stored draft to a new key (new post -> created id) ── */
  const moveLocalDraft = useCallback((newId: string) => {
    const from = draftKey(post?.id ?? null);
    const to = draftKey(newId);
    try {
      const raw = localStorage.getItem(from);
      if (raw) { localStorage.setItem(to, raw); localStorage.removeItem(from); }
    } catch { /* ignore */ }
  }, [post?.id]);

  /* ── Debounced autosave ── */
  const runAutosaveNow = useCallback(async () => {
    if (manualSavingRef.current) return;
    if (autosavingRef.current) { pendingAutosaveRef.current = true; return; }

    const run = async () => {
      const data = latestDataRef.current;
      if (!data || JSON.stringify(data) === lastSavedRef.current) return;

      autosavingRef.current = true;
      setAutoSaving(true);
      try {
        const id = postIdRef.current;
        const payload: Record<string, unknown> = { ...data };
        if (!payload.slug) {
          if (id) delete payload.slug;
          else payload.slug = `untitled-${Date.now()}`;
        }
        // Autosave never changes publication status — it keeps whatever the row
        // currently has so half-written articles are never published.
        payload.published = publishedOnceRef.current;

        const result = id
          ? await adminUpdate("blog_posts", id, payload)
          : await adminCreate("blog_posts", payload);

        if (result?.error) {
          console.error("[autosave]", result.error);
          return;
        }
        if (!id && result.success && result.id) {
          moveLocalDraft(result.id);
          postIdRef.current = result.id;
          window.history.replaceState(null, "", `/admin/blog/${result.id}/edit`);
        }
        lastSavedRef.current = JSON.stringify(data);
        setDirty(false);
        setAutoSavedAt(new Date());
      } catch (err) {
        console.error("[autosave]", err);
      } finally {
        autosavingRef.current = false;
        setAutoSaving(false);
        if (pendingAutosaveRef.current && !manualSavingRef.current) {
          pendingAutosaveRef.current = false;
          scheduleAutosaveRef.current();
        }
      }
    };

    inFlightAutosaveRef.current = run().finally(() => {
      inFlightAutosaveRef.current = null;
    });
    await inFlightAutosaveRef.current;
  }, [moveLocalDraft]);

  const runAutosaveNowRef = useRef(runAutosaveNow);
  useEffect(() => { runAutosaveNowRef.current = runAutosaveNow; }, [runAutosaveNow]);

  const scheduleAutosave = useCallback(() => {
    if (manualSavingRef.current) return;
    if (autosavingRef.current) { pendingAutosaveRef.current = true; return; }
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    const timer = setTimeout(() => { void runAutosaveNowRef.current(); }, AUTOSAVE_DEBOUNCE_MS);
    autosaveTimerRef.current = timer;
  }, []);

  const scheduleAutosaveRef = useRef(scheduleAutosave);
  useEffect(() => { scheduleAutosaveRef.current = scheduleAutosave; }, [scheduleAutosave]);

  useEffect(() => {
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = null;
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, []);

  /* ── Mirror every keystroke to localStorage + schedule autosave ── */
  const postId = post?.id ?? null;
  useEffect(() => {
    const payload = buildPayload();
    latestDataRef.current = payload;
    const snapshot = JSON.stringify(payload);
    if (initialSnapshotRef.current === null) initialSnapshotRef.current = snapshot;
    // Nothing changed yet (initial render) — don't write a draft or autosave.
    if (snapshot === initialSnapshotRef.current) return;
    try {
      localStorage.setItem(draftKey(postIdRef.current ?? postId), JSON.stringify({ savedAt: Date.now(), data: payload }));
    } catch { /* ignore */ }
    scheduleAutosave();
    // scheduleAutosave is stable; buildPayload carries the field deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildPayload, postId]);

  /* ── Recover an unsaved draft after a device shutdown / browser crash ── */
  useEffect(() => {
    if (draftRecoveredRef.current) return;
    draftRecoveredRef.current = true;
    try {
      const raw = localStorage.getItem(draftKey(postId));
      if (!raw) return;
      const parsed = JSON.parse(raw) as { data?: AutosavePayload } | null;
      const payload = parsed?.data;
      if (!payload) return;
      const hasContent = Boolean(
        String(payload.title ?? "").trim() ||
        String(payload.content ?? "").trim() ||
        String(payload.featured_image ?? "").trim(),
      );
      if (!hasContent) return;
      if (JSON.stringify(payload) === initialSnapshotRef.current) return;

      setTitle(String(payload.title ?? ""));
      if (payload.slug) { setSlug(String(payload.slug)); setSlugTouched(true); }
      setAuthor(String(payload.author ?? ""));
      setCategory(String(payload.category ?? ""));
      setTags(Array.isArray(payload.tags) ? payload.tags.join(", ") : String(payload.tags ?? ""));
      setContent(String(payload.content ?? ""));
      setSeoTitle(String(payload.seo_title ?? ""));
      setSeoDesc(String(payload.seo_description ?? ""));
      setFeatured(Boolean(payload.featured));
      setPublished(Boolean(payload.published));
      const pd = typeof payload.published_date === "string" ? payload.published_date : "";
      if (pd) setPublishedDate(pd.slice(0, 16));
      if (typeof payload.featured_image === "string" && !payload.featured_image.startsWith("blob:")) {
        setFeaturedImage(payload.featured_image);
      }
      setDirty(true);
      toast.success("Recovered unsaved changes from autosave", { id: "draft-restore" });
    } catch { /* ignore */ }
  }, [postId]);

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
    setSaving(publish ? "publish" : "save");
    manualSavingRef.current = true;
    if (autosaveTimerRef.current) { clearTimeout(autosaveTimerRef.current); autosaveTimerRef.current = null; }

    let finalImage = featuredImage;
    try { finalImage = await uploadFeatured(); }
    catch (err) { toast.error((err as Error).message); setSaving(null); manualSavingRef.current = false; return; }

    // If the first autosave is still creating the row (its response has not
    // landed yet), wait for it so postIdRef is set and Publish becomes an
    // update of that row instead of a second create that would collide on the
    // unique slug and leave the article unpublished.
    try {
      if (inFlightAutosaveRef.current) await inFlightAutosaveRef.current;
    } catch { /* autosave already surfaced its error */ }

    const id = postIdRef.current;
    const autosaveData = buildPayload(finalImage, publish);
    const data: Record<string, unknown> = { ...autosaveData };

    try {
      const result = id
        ? await adminUpdate("blog_posts", id, data)
        : await adminCreate("blog_posts", data);
      if (!result) { toast.error("Save did not respond. Please try again."); return; }
      if (result.error) { toast.error(result.error); return; }
      if (!id && result.success && result.id) {
        moveLocalDraft(result.id);
        postIdRef.current = result.id;
        window.history.replaceState(null, "", `/admin/blog/${result.id}/edit`);
      }
      setPublished(publish);
      publishedOnceRef.current = publish;
      setDirty(false);
      setAutoSavedAt(new Date());
      lastSavedRef.current = JSON.stringify(data);
      clearLocalDraft();
      toast.success(publish ? (isEdit ? "Post updated and published" : "Post published") : "Draft saved");
      router.refresh();
    } catch (err) {
      console.error("[blog-save]", err);
      toast.error("An unexpected error occurred while saving. Please try again.");
    } finally {
      setSaving(null);
      manualSavingRef.current = false;
    }
  }

  /* ── Delete ── */
  async function handleDelete() {
    if (!post) return;
    if (!confirm("Delete this post permanently? This cannot be undone.")) return;
    try {
      const result = await adminDelete("blog_posts", post.id);
      if (result.error) { toast.error(result.error); return; }
      clearLocalDraft();
      toast.success("Post deleted");
      router.push("/admin/blog");
    } catch (err) {
      console.error("[blog-delete]", err);
      toast.error("An unexpected error occurred while deleting. Please try again.");
    }
  }

  /* ── Preview ── */
  if (previewOpen) {
    const previewPost = {
      title, category, author, published_date: safePublishDateISO(publishedDate),
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
              {autoSaving ? (
                <span className="ml-2 text-navy-400">Autosaving…</span>
              ) : autoSavedAt ? (
                <span className="ml-2 text-navy-400">Autosaved {formatDateTime(autoSavedAt)}</span>
              ) : null}
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
            {saving === "publish" ? "Saving..." : (isEdit ? "Update" : "Publish")}
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