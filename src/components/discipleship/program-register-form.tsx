"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";
import type { DiscipleshipProgram } from "@/types";

interface Props {
  program: DiscipleshipProgram;
}

export function ProgramRegisterForm({ program }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const res = await import("@/app/actions").then((m) =>
      m.registerForProgram(formData)
    );
    setSubmitting(false);
    if ("error" in res && res.error) {
      toast.error(res.error);
      return;
    }
    setDone(true);
    formRef.current?.reset();
    toast.success("Registration received! We'll be in touch.");
  }

  if (done) {
    return (
      <div className="rounded-xl bg-gold-50 p-6 text-center">
        <p className="font-semibold text-navy-900">Thank you for registering!</p>
        <p className="mt-1 text-sm text-navy-600">
          We&apos;ve received your interest in <strong>{program.title}</strong> and will contact you soon.
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="program" value={program.title} />
      <div>
        <label htmlFor={`name-${program.id}`} className="mb-1 block text-sm font-medium text-navy-700">
          Full Name
        </label>
        <input
          id={`name-${program.id}`}
          name="name"
          required
          className="w-full rounded-lg border border-navy-200 px-4 py-2.5 text-navy-900 focus:border-gold-500 focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor={`email-${program.id}`} className="mb-1 block text-sm font-medium text-navy-700">
          Email
        </label>
        <input
          id={`email-${program.id}`}
          name="email"
          type="email"
          required
          className="w-full rounded-lg border border-navy-200 px-4 py-2.5 text-navy-900 focus:border-gold-500 focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-navy-800 px-4 py-3 font-semibold text-white transition-colors hover:bg-navy-900 disabled:opacity-60"
      >
        {submitting ? "Registering..." : "Register for this Program"}
      </button>
    </form>
  );
}
