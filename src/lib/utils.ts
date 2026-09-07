import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined) {
  const text = safeFormat(date, "MMM d, yyyy");
  return text === null ? "" : text;
}

export function formatDateTime(date: string | Date | null | undefined) {
  const text = safeFormat(date, "MMM d, yyyy h:mm a");
  return text === null ? "" : text;
}

function safeFormat(date: string | Date | null | undefined, pattern: string): string | null {
  if (!date) return null;
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    if (isNaN(d.getTime())) return null;
    return format(d, pattern);
  } catch {
    return null;
  }
}

export function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function toPlainText(html: string) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
