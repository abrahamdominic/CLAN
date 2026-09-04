"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Upload, Trash2, ImageIcon, FileAudio, FileVideo, FileText } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Pagination } from "@/components/admin/pagination";
import { Badge } from "@/components/admin/admin-form-fields";
import { adminDelete, uploadFile } from "@/components/admin/admin-actions";
import toast from "react-hot-toast";
import type { Media } from "@/types";

export default function AdminMediaPage() {
  const [media, setMedia] = useState<Media[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const perPage = 20;

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/media?page=${page}`);
      const data = await res.json();
      setMedia(data.data);
      setCount(data.count);
    } catch { /* empty */ }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadFile(fd);
    setUploading(false);
    if (result.error) toast.error(result.error);
    else { toast.success("File uploaded"); load(); }
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this media file?")) return;
    const result = await adminDelete("media", id);
    if (result.error) toast.error(result.error);
    else { toast.success("Deleted"); load(); }
  }

  function getIcon(type: string | null) {
    if (!type) return <FileText className="h-5 w-5" />;
    if (type.startsWith("image")) return <ImageIcon className="h-5 w-5" />;
    if (type.startsWith("audio")) return <FileAudio className="h-5 w-5" />;
    if (type.startsWith("video")) return <FileVideo className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  }

  function formatSize(bytes: number | null) {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  }

  return (
    <>
      <AdminPageHeader
        title="Media Library"
        description="Manage uploaded files"
        action={
          <>
            <input ref={inputRef} type="file" className="hidden" onChange={handleUpload} accept="image/*,audio/*,video/*,.pdf" />
            <button onClick={() => inputRef.current?.click()} disabled={uploading} className="flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-60">
              <Upload className="h-4 w-4" /> {uploading ? "Uploading..." : "Upload File"}
            </button>
          </>
        }
      />

      {media.length === 0 ? (
        <div className="rounded-xl border border-dashed border-navy-200 bg-white p-12 text-center">
          <p className="text-sm text-navy-400">No media files uploaded yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {media.map((m) => (
            <div key={m.id} className="group relative overflow-hidden rounded-xl border border-navy-100 bg-white shadow-sm">
              {m.type?.startsWith("image") ? (
                <div className="aspect-video bg-navy-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.url} alt={m.alt || m.name} className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="flex aspect-video items-center justify-center bg-navy-50 text-navy-400">
                  {getIcon(m.type)}
                </div>
              )}
              <div className="p-3">
                <p className="truncate text-sm font-medium text-navy-900">{m.name}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge>{m.type?.split("/")[1] || "file"}</Badge>
                  {m.size && <span className="text-xs text-navy-400">{formatSize(m.size)}</span>}
                </div>
              </div>
              <button
                onClick={() => handleDelete(m.id)}
                className="absolute right-2 top-2 rounded-lg bg-white/90 p-1.5 text-red-400 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} total={count} perPage={perPage} onPageChange={setPage} />
    </>
  );
}
