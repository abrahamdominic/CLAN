"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";

export function TestimonyForm() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const res = await import("@/app/actions").then((m) => m.submitTestimonial(formData));
    setSubmitting(false);
    if ("error" in res && res.error) {
      toast.error(res.error as string);
      return;
    }
    setDone(true);
    formRef.current?.reset();
    toast.success("Thank you! Your testimony will be reviewed before publishing.");
  }

  if (done) {
    return (
      <div className="rounded-2xl bg-gold-50 p-10 text-center">
        <h3 className="font-display text-2xl font-bold text-navy-900">Thank You for Sharing!</h3>
        <p className="mx-auto mt-3 max-w-md text-navy-600">
          We&apos;re grateful for what God has done in your life. Your testimony will be reviewed
          by our team before being published.
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="tname" className="mb-1 block text-sm font-medium text-navy-700">Name</label>
          <input id="tname" name="name" required className="w-full rounded-lg border border-navy-200 px-4 py-2.5 text-navy-900 focus:border-gold-500 focus:outline-none" />
        </div>
        <div>
          <label htmlFor="temail" className="mb-1 block text-sm font-medium text-navy-700">Email</label>
          <input id="temail" name="email" type="email" className="w-full rounded-lg border border-navy-200 px-4 py-2.5 text-navy-900 focus:border-gold-500 focus:outline-none" />
        </div>
      </div>
      <div>
        <label htmlFor="testimony" className="mb-1 block text-sm font-medium text-navy-700">Your Testimony</label>
        <textarea id="testimony" name="testimony" required rows={6} placeholder="Share what God has done in your life..." className="w-full rounded-lg border border-navy-200 px-4 py-2.5 text-navy-900 focus:border-gold-500 focus:outline-none" />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-navy-800 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-navy-900 disabled:opacity-60"
      >
        {submitting ? "Submitting..." : "Share Your Testimony"}
      </button>
    </form>
  );
}
