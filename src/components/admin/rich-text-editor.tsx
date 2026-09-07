"use client";

import { useCallback, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Code, Minus, AlignLeft, AlignCenter, AlignRight,
  Link as LinkIcon, ImageIcon, Undo2, Redo2, RemoveFormatting,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadBlogImage } from "@/components/admin/admin-actions";

/* ── Paste cleaning ─────────────────────────────────────────────── */

function cleanPastedHTML(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");

  doc.querySelectorAll("script, style, meta, link, title").forEach((el) => el.remove());
  doc.querySelectorAll("o\\:p, w\\:sdt, w\\:body, w\\:tbl, w\\:tr, w\\:tc").forEach((el) => el.remove());

  doc.querySelectorAll("[class]").forEach((el) => {
    el.removeAttribute("class");
  });
  doc.querySelectorAll("[style]").forEach((el) => {
    const style = el.getAttribute("style") || "";
    const cleaned: string[] = [];
    for (const part of style.split(";")) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      const prop = trimmed.split(":")[0]?.trim().toLowerCase() ?? "";
      if (prop.startsWith("mso-")) continue;
      if (prop === "font-family" || prop === "font-size" || prop === "color" || prop === "background-color") continue;
      if (prop === "text-align") cleaned.push(trimmed);
      if (prop === "text-decoration" && trimmed.includes("underline")) cleaned.push("text-decoration: underline");
    }
    if (cleaned.length > 0) el.setAttribute("style", cleaned.join("; "));
    else el.removeAttribute("style");
  });
  doc.querySelectorAll("[data-*]").forEach((el) => {
    [...el.attributes].filter((a) => a.name.startsWith("data-")).forEach((a) => el.removeAttribute(a.name));
  });

  doc.querySelectorAll("font").forEach((el) => {
    const parent = el.parentNode;
    if (parent) while (el.firstChild) parent.insertBefore(el.firstChild, el);
    el.remove();
  });

  doc.querySelectorAll("span").forEach((el) => {
    if (el.getAttribute("style")) return;
    const parent = el.parentNode;
    if (parent) while (el.firstChild) parent.insertBefore(el.firstChild, el);
    el.remove();
  });

  return doc.body.innerHTML;
}

/* ── Toolbar button ─────────────────────────────────────────────── */

function ToolbarBtn({
  onClick, active, disabled, children, title,
}: {
  onClick: () => void; active?: boolean; disabled?: boolean; children: React.ReactNode; title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "rounded p-1.5 transition-colors",
        active ? "bg-navy-900 text-white" : "text-navy-500 hover:bg-navy-100 hover:text-navy-700",
        disabled && "opacity-40 pointer-events-none",
      )}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="mx-1 h-6 w-px bg-navy-200" />;
}

/* ── Main component ─────────────────────────────────────────────── */

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadingRef = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Image.configure({ inline: false, allowBase64: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: placeholder ?? "Start writing your article..." }),
    ],
    content,
    editorProps: {
      transformPastedHTML: cleanPastedHTML,
      attributes: {
        class: "prose-content focus:outline-none min-h-[300px] px-1 py-2",
      },
    },
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
  });

  const handleImageFile = useCallback(async (file: File | null) => {
    if (!file || !editor || uploadingRef.current) return;
    uploadingRef.current = true;
    try {
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadBlogImage(fd);
      if (result.error) {
        const { default: toast } = await import("react-hot-toast");
        toast.error(result.error);
        return;
      }
      editor.chain().focus().setImage({ src: result.url!, alt: file.name.replace(/\.\w+$/, "") }).run();
    } finally {
      uploadingRef.current = false;
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [editor]);

  const addImage = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href ?? "";
    const url = window.prompt("Enter URL:", prev);
    if (url === null) return;
    if (url === "") { editor.chain().focus().extendMarkRange("link").unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return <div className="min-h-[300px] rounded-lg border border-navy-200 bg-navy-50 p-4 text-sm text-navy-400">Loading editor...</div>;

  return (
    <div className="rounded-lg border border-navy-200 bg-white">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleImageFile(e.target.files?.[0] ?? null)}
      />
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-navy-100 px-2 py-1.5">
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
          <Bold className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
          <Italic className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline">
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
          <Strikethrough className="h-4 w-4" />
        </ToolbarBtn>

        <ToolbarDivider />

        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Heading 1">
          <Heading1 className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">
          <Heading2 className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3">
          <Heading3 className="h-4 w-4" />
        </ToolbarBtn>

        <ToolbarDivider />

        <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List">
          <List className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Ordered List">
          <ListOrdered className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote">
          <Quote className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code Block">
          <Code className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">
          <Minus className="h-4 w-4" />
        </ToolbarBtn>

        <ToolbarDivider />

        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align Left">
          <AlignLeft className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Align Center">
          <AlignCenter className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align Right">
          <AlignRight className="h-4 w-4" />
        </ToolbarBtn>

        <ToolbarDivider />

        <ToolbarBtn onClick={setLink} active={editor.isActive("link")} title="Insert Link">
          <LinkIcon className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={addImage} title="Insert Image">
          <ImageIcon className="h-4 w-4" />
        </ToolbarBtn>

        <ToolbarDivider />

        <ToolbarBtn onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Clear Formatting">
          <RemoveFormatting className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
          <Undo2 className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
          <Redo2 className="h-4 w-4" />
        </ToolbarBtn>
      </div>

      {/* ── Editor area ── */}
      <EditorContent editor={editor} className="px-4 py-3" />
    </div>
  );
}
