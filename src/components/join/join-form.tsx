"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";

const interestOptions = [
  "Discipleship",
  "Prayer",
  "Outreach",
  "Bible Study",
  "Media",
  "Worship",
  "Mentorship",
  "Volunteering",
  "Leadership",
];

const discoverOptions = [
  "Friend or Family",
  "Social Media",
  "Website",
  "Event",
  "Online Search",
  "Other",
];

export function JoinForm() {
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
    toast.success("Welcome to CLAN! We'll be in touch.");
  }

  if (done) {
    return (
      <div className="rounded-2xl bg-gold-50 p-10 text-center">
        <h3 className="font-display text-2xl font-bold text-navy-900">Welcome to CLAN!</h3>
        <p className="mx-auto mt-3 max-w-md text-navy-600">
          Thank you for expressing interest in joining our community. Our team will reach out to
          you soon to welcome you and help you get connected.
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="full_name" className="mb-1 block text-sm font-medium text-navy-700">Full Name</label>
          <input id="full_name" name="full_name" required className="w-full rounded-lg border border-navy-200 px-4 py-2.5 text-navy-900 focus:border-gold-500 focus:outline-none" />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-navy-700">Email</label>
          <input id="email" name="email" type="email" required className="w-full rounded-lg border border-navy-200 px-4 py-2.5 text-navy-900 focus:border-gold-500 focus:outline-none" />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-navy-700">Phone</label>
          <input id="phone" name="phone" className="w-full rounded-lg border border-navy-200 px-4 py-2.5 text-navy-900 focus:border-gold-500 focus:outline-none" />
        </div>
        <div>
          <label htmlFor="location" className="mb-1 block text-sm font-medium text-navy-700">Location</label>
          <input id="location" name="location" className="w-full rounded-lg border border-navy-200 px-4 py-2.5 text-navy-900 focus:border-gold-500 focus:outline-none" />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="church" className="mb-1 block text-sm font-medium text-navy-700">
            Church / Denomination <span className="text-navy-400">(optional)</span>
          </label>
          <input id="church" name="church" className="w-full rounded-lg border border-navy-200 px-4 py-2.5 text-navy-900 focus:border-gold-500 focus:outline-none" />
        </div>
        <div>
          <label htmlFor="discovered_via" className="mb-1 block text-sm font-medium text-navy-700">How did you discover CLAN?</label>
          <select id="discovered_via" name="discovered_via" className="w-full rounded-lg border border-navy-200 px-4 py-2.5 text-navy-900 focus:border-gold-500 focus:outline-none">
            {discoverOptions.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
      </div>

      <fieldset>
        <legend className="mb-3 text-sm font-medium text-navy-700">Areas of Interest</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {interestOptions.map((opt) => (
            <label key={opt} className="flex cursor-pointer items-center gap-2 rounded-lg border border-navy-200 px-3 py-2.5 text-sm transition-colors has-[:checked]:border-gold-500 has-[:checked]:bg-gold-50">
              <input type="checkbox" name="areas_of_interest" value={opt.toLowerCase()} className="accent-gold-500" />
              {opt}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium text-navy-700">
          Message <span className="text-navy-400">(optional)</span>
        </label>
        <textarea id="message" name="message" rows={4} className="w-full rounded-lg border border-navy-200 px-4 py-2.5 text-navy-900 focus:border-gold-500 focus:outline-none" />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-navy-800 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-navy-900 disabled:opacity-60"
      >
        {submitting ? "Submitting..." : "Join CLAN"}
      </button>
    </form>
  );
}
