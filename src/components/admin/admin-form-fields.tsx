"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FieldProps {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number | readonly string[] | undefined;
  placeholder?: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  textarea?: boolean;
  rows?: number;
}

export function Field({
  label, name, type = "text", required, defaultValue, placeholder, description, children, className, textarea, rows = 4,
}: FieldProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <label htmlFor={name} className="block text-sm font-medium text-navy-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children ? (
        children
      ) : textarea ? (
        <textarea
          id={name}
          name={name}
          required={required}
          defaultValue={defaultValue}
          placeholder={placeholder}
          rows={rows}
          className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm text-navy-900 placeholder:text-navy-400 focus:border-gold-400 focus:outline-none"
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          required={required}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm text-navy-900 placeholder:text-navy-400 focus:border-gold-400 focus:outline-none"
        />
      )}
      {description && <p className="text-xs text-navy-400">{description}</p>}
    </div>
  );
}

export function CheckboxField({
  label, name, defaultChecked, description,
}: {
  label: string; name: string; defaultChecked?: boolean; description?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <input
        id={name}
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="mt-0.5 h-4 w-4 rounded border-navy-300 text-gold-500 focus:ring-gold-400"
      />
      <div>
        <label htmlFor={name} className="text-sm font-medium text-navy-700">{label}</label>
        {description && <p className="text-xs text-navy-400">{description}</p>}
      </div>
    </div>
  );
}

export function SelectField({
  label, name, required, defaultValue, options, className,
}: {
  label: string; name: string; required?: boolean; defaultValue?: string; options: { value: string; label: string }[]; className?: string;
}) {
  return (
    <Field label={label} name={name} required={required} className={className}>
      <select
        id={name}
        name={name}
        required={required}
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm text-navy-900 focus:border-gold-400 focus:outline-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </Field>
  );
}

export function FormActions({ onCancel, saving }: { onCancel: () => void; saving: boolean }) {
  return (
    <div className="flex items-center justify-end gap-3 pt-4">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-lg border border-navy-200 px-4 py-2 text-sm font-medium text-navy-700 hover:bg-navy-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}

export function Badge({ children, variant = "default" }: { children: ReactNode; variant?: "default" | "success" | "warning" | "danger" | "info" }) {
  const styles = {
    default: "bg-navy-100 text-navy-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", styles[variant])}>
      {children}
    </span>
  );
}

export function EmptyState({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-navy-200 bg-white p-12 text-center">
      <p className="text-sm text-navy-400">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
