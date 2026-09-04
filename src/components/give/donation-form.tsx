"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";

const categories = [
  "Outreach",
  "Discipleship",
  "Missions",
  "Community support",
  "Media",
  "General ministry",
];

const presetAmounts = [25, 50, 100, 250, 500];

export function DonationForm() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [amount, setAmount] = useState(50);
  const [custom, setCustom] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const effectiveAmount = Number(custom) || amount;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("amount", String(effectiveAmount));
    setSubmitting(true);
    const res = await import("@/app/actions").then((m) => m.createDonationIntent(formData));
    setSubmitting(false);
    if ("error" in res && res.error) {
      toast.error(res.error as string);
      return;
    }
    if (res.mode === "paystack" && res.authorizationUrl) {
      window.location.href = res.authorizationUrl;
      return;
    }
    // test mode, success recorded
    setDone(true);
    formRef.current?.reset();
    toast.success("Thank you for your generous gift!");
  }

  if (done) {
    return (
      <div className="rounded-2xl bg-gold-50 p-10 text-center">
        <h3 className="font-display text-2xl font-bold text-navy-900">Thank You for Giving!</h3>
        <p className="mx-auto mt-3 max-w-md text-navy-600">
          Your gift supports outreach, discipleship, missions and the work of the Kingdom through
          CLAN. &quot;God loves a cheerful giver.&quot; 2 Corinthians 9:7
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-3 block text-sm font-medium text-navy-700">Choose an Amount</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {presetAmounts.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => {
                setAmount(a);
                setCustom("");
              }}
              className={`rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors ${
                effectiveAmount === a
                  ? "border-gold-500 bg-gold-50 text-navy-900"
                  : "border-navy-200 text-navy-700 hover:border-gold-300"
              }`}
            >
              ${a}
            </button>
          ))}
        </div>
        <div className="mt-3">
          <label htmlFor="custom" className="mb-1 block text-sm font-medium text-navy-700">Custom Amount</label>
          <input
            id="custom"
            type="number"
            min="1"
            placeholder="$"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            className="w-full rounded-lg border border-navy-200 px-4 py-2.5 text-navy-900 focus:border-gold-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label htmlFor="category" className="mb-1 block text-sm font-medium text-navy-700">Giving Category</label>
        <select id="category" name="category" className="w-full rounded-lg border border-navy-200 px-4 py-2.5 text-navy-900 focus:border-gold-500 focus:outline-none">
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="donor_name" className="mb-1 block text-sm font-medium text-navy-700">Name <span className="text-navy-400">(optional)</span></label>
          <input id="donor_name" name="donor_name" className="w-full rounded-lg border border-navy-200 px-4 py-2.5 text-navy-900 focus:border-gold-500 focus:outline-none" />
        </div>
        <div>
          <label htmlFor="donor_email" className="mb-1 block text-sm font-medium text-navy-700">Email <span className="text-navy-400">(optional)</span></label>
          <input id="donor_email" name="donor_email" type="email" className="w-full rounded-lg border border-navy-200 px-4 py-2.5 text-navy-900 focus:border-gold-500 focus:outline-none" />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-gold-500 px-6 py-3.5 font-semibold text-navy-950 transition-colors hover:bg-gold-600 disabled:opacity-60"
      >
        {submitting ? "Processing..." : `Give $${effectiveAmount || 0}`}
      </button>
      <p className="text-center text-xs text-navy-400">
        We never store your card details directly. Payments are processed securely through our payment provider.
      </p>
    </form>
  );
}
