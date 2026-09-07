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

const currencies: { code: string; symbol: string; label: string }[] = [
  { code: "USD", symbol: "$", label: "US Dollar ($)" },
  { code: "GBP", symbol: "£", label: "British Pound (£)" },
  { code: "NGN", symbol: "₦", label: "Nigerian Naira (₦)" },
  { code: "EUR", symbol: "€", label: "Euro (€)" },
  { code: "CAD", symbol: "C$", label: "Canadian Dollar (C$)" },
  { code: "GHS", symbol: "GH₵", label: "Ghanaian Cedi (GH₵)" },
];

const presetAmounts = [25, 50, 100, 250, 500];

export function DonationForm() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [note, setNote] = useState("");
  const [amount, setAmount] = useState(50);
  const [custom, setCustom] = useState("");
  const [currency, setCurrency] = useState("USD");
  const formRef = useRef<HTMLFormElement>(null);

  const active = currencies.find((c) => c.code === currency) || currencies[0];
  const effectiveAmount = Number(custom) || amount;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    const formData = new FormData(e.currentTarget);
    formData.set("amount", String(effectiveAmount));
    formData.set("currency", currency);
    setSubmitting(true);
    try {
      const res = await import("@/app/actions").then((m) => m.createDonationIntent(formData));
      if (!res) throw new Error("No response from server");
      if ("error" in res && res.error) {
        toast.error(res.error as string);
        return;
      }
      if (res.mode === "paystack" && res.authorizationUrl) {
        window.location.href = res.authorizationUrl;
        return;
      }
      if (res.mode === "stripe" && res.url) {
        window.location.href = res.url;
        return;
      }
      // test mode / recorded offline, success recorded
      setDone(true);
      setNote("note" in res && res.note ? res.note : "");
      formRef.current?.reset();
      toast.success("Thank you for your generous gift!");
    } catch {
      // Never leave the button stuck in "Processing..." or the page in a broken
      // state if the server action rejects unexpectedly.
      toast.error("Payment could not be started. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl bg-gold-50 p-10 text-center">
        <h3 className="font-display text-2xl font-bold text-navy-900">Thank You for Giving!</h3>
        <p className="mx-auto mt-3 max-w-md text-navy-600">
          Your gift supports outreach, discipleship, missions and the work of the Kingdom through
          CLAN. &quot;God loves a cheerful giver.&quot; 2 Corinthians 9:7
        </p>
        {note && (
          <p className="mx-auto mt-4 max-w-md rounded-lg border border-gold-300 bg-white px-4 py-3 text-sm text-navy-700">
            {note}
          </p>
        )}
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium text-navy-700">Currency</label>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="w-full rounded-lg border border-navy-200 px-4 py-2.5 text-navy-900 focus:border-gold-500 focus:outline-none"
          aria-label="Select currency"
        >
          {currencies.map((c) => (
            <option key={c.code} value={c.code}>{c.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-3 block text-sm font-medium text-navy-700">Choose an Amount ({active.symbol})</label>
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
              {active.symbol}{a}
            </button>
          ))}
        </div>
        <div className="mt-3">
          <label htmlFor="custom" className="mb-1 block text-sm font-medium text-navy-700">Custom Amount</label>
          <input
            id="custom"
            type="number"
            min="1"
            placeholder={`${active.symbol}0.00`}
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
        {submitting ? "Processing..." : `Give ${active.symbol}${effectiveAmount || 0}`}
      </button>
      <p className="text-center text-xs text-navy-400">
        We never store your card details directly. Payments are processed securely through our payment provider.
      </p>
    </form>
  );
}
