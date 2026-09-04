"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";

const categories = [
  "Personal",
  "Family",
  "Health",
  "Finances",
  "Guidance",
  "Salvation",
  "Relationships",
  "Other",
];

const visibilityOptions = [
  {
    value: "private",
    title: "Private",
    description: "Only our team will see this and pray with you.",
  },
  {
    value: "anonymous",
    title: "Anonymous",
    description: "We'll pray without sharing your name.",
  },
  {
    value: "public",
    title: "Public / Testimonial",
    description: "You're happy for your testimony to be shared.",
  },
];

export function PrayerRequestForm() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const res = await import("@/app/actions").then((m) => m.submitPrayerRequest(formData));
    setSubmitting(false);
    if ("error" in res && res.error) {
      toast.error(res.error as string);
      return;
    }
    setDone(true);
    formRef.current?.reset();
    toast.success("Prayer request received! We're standing with you.");
  }

  if (done) {
    return (
      <div className="rounded-2xl bg-gold-50 p-10 text-center">
        <h3 className="font-display text-2xl font-bold text-navy-900">We&apos;re Praying With You</h3>
        <p className="mx-auto mt-3 max-w-md text-navy-600">
          Thank you for trusting us with your request. Our team will lift it up in prayer.
          &quot;The prayer of a righteous person is powerful and effective.&quot; James 5:16
        </p>
        <button
          onClick={() => setDone(false)}
          className="mt-6 font-semibold text-gold-700 hover:underline"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-navy-700">Name</label>
          <input
            id="name"
            name="name"
            required
            className="w-full rounded-lg border border-navy-200 px-4 py-2.5 text-navy-900 focus:border-gold-500 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-navy-700">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            className="w-full rounded-lg border border-navy-200 px-4 py-2.5 text-navy-900 focus:border-gold-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-navy-700">
            Phone <span className="text-navy-400">(optional)</span>
          </label>
          <input
            id="phone"
            name="phone"
            className="w-full rounded-lg border border-navy-200 px-4 py-2.5 text-navy-900 focus:border-gold-500 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="category" className="mb-1 block text-sm font-medium text-navy-700">Category</label>
          <select
            id="category"
            name="category"
            className="w-full rounded-lg border border-navy-200 px-4 py-2.5 text-navy-900 focus:border-gold-500 focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="request" className="mb-1 block text-sm font-medium text-navy-700">Prayer Request</label>
        <textarea
          id="request"
          name="request"
          required
          rows={5}
          placeholder="Share your burden with us..."
          className="w-full rounded-lg border border-navy-200 px-4 py-2.5 text-navy-900 focus:border-gold-500 focus:outline-none"
        />
      </div>

      <fieldset>
        <legend className="mb-3 text-sm font-medium text-navy-700">Privacy Preference</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {visibilityOptions.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-navy-200 p-4 transition-colors has-[:checked]:border-gold-500 has-[:checked]:bg-gold-50"
            >
              <input
                type="radio"
                name="visibility"
                value={opt.value}
                defaultChecked={opt.value === "private"}
                className="mt-1 accent-gold-500"
              />
              <span>
                <span className="block font-semibold text-navy-900">{opt.title}</span>
                <span className="text-sm text-navy-500">{opt.description}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-navy-800 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-navy-900 disabled:opacity-60"
      >
        {submitting ? "Submitting..." : "Submit Prayer Request"}
      </button>
    </form>
  );
}
