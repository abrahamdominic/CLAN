"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";

const focusAreas = [
  "Spiritual Gifts",
  "Finding My Calling",
  "Personal Growth",
  "Serving & Service",
  "Leadership",
  "Mentorship",
  "Purpose Discovery",
  "Practical Living",
];

export function PurposeInterestForm() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const res = await import("@/app/actions").then((m) => m.submitJoinForm(formData));
    setSubmitting(false);
    if ("error" in res && res.error) {
      toast.error(res.error as string);
      return;
    }
    setDone(true);
    formRef.current?.reset();
    toast.success("Thank you! A mentor will reach out to guide you.");
  }

  if (done) {
    return (
      <div className="rounded-2xl bg-gold-50 p-8 text-center">
        <h3 className="font-display text-2xl font-bold text-navy-900">We&apos;re Here to Guide You</h3>
        <p className="mx-auto mt-3 max-w-md text-navy-600">
          Thank you for reaching out. Our team will connect you with resources and mentorship to
          help you discover and walk in your purpose.
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="pfname" className="mb-1 block text-sm font-medium text-navy-700">Full Name</label>
        <input id="pfname" name="full_name" required className="w-full rounded-lg border border-navy-200 px-4 py-2.5 text-navy-900 focus:border-gold-500 focus:outline-none" />
      </div>
      <div>
        <label htmlFor="pemail" className="mb-1 block text-sm font-medium text-navy-700">Email</label>
        <input id="pemail" name="email" type="email" required className="w-full rounded-lg border border-navy-200 px-4 py-2.5 text-navy-900 focus:border-gold-500 focus:outline-none" />
      </div>

      <input type="hidden" name="areas_of_interest" value="purpose,mentorship" />
      <input type="hidden" name="discovered_via" value="Purpose Page" />

      <fieldset>
        <legend className="mb-3 text-sm font-medium text-navy-700">Where would you like guidance?</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {focusAreas.map((opt) => (
            <label key={opt} className="flex cursor-pointer items-center gap-2 rounded-lg border border-navy-200 px-3 py-2.5 text-sm transition-colors has-[:checked]:border-gold-500 has-[:checked]:bg-gold-50">
              <input type="checkbox" name="focus_areas" value={opt.toLowerCase()} className="accent-gold-500" />
              {opt}
            </label>
          ))}
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-navy-800 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-navy-900 disabled:opacity-60"
      >
        {submitting ? "Submitting..." : "Discover Your Purpose"}
      </button>
    </form>
  );
}
