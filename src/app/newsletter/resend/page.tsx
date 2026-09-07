"use client";

import { useState } from "react";
import { ArrowLeft, MailPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ResendConfirmationPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/newsletter/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setSubmitting(false);

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      if (data.alreadyConfirmed) {
        router.push("/newsletter/confirm?status=already");
        return;
      }

      if (data.confirmationUrl) {
        router.push(data.confirmationUrl);
        return;
      }

      setMessage(data.message || "If your email is subscribed, a new confirmation link has been sent.");
    } catch {
      setSubmitting(false);
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-navy-50/30 px-4 py-16">
      <div className="w-full max-w-lg rounded-2xl border border-navy-100 bg-white p-10 shadow-sm">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-navy-50">
          <MailPlus className="h-10 w-10 text-navy-700" />
        </div>
        <h1 className="mt-6 text-center font-display text-3xl font-bold text-navy-900">
          Resend Confirmation
        </h1>
        <p className="mx-auto mt-4 max-w-md text-center text-navy-600">
          Enter the email address you used to subscribe and we&apos;ll send you a
          fresh confirmation link.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="w-full rounded-lg border border-navy-200 px-4 py-3 text-sm text-navy-900 focus:border-gold-400 focus:outline-none"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          {message && <p className="text-sm text-green-600">{message}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-navy-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-navy-800 disabled:opacity-60"
          >
            {submitting ? "Sending..." : "Send Confirmation Link"}
          </button>
        </form>

        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 text-sm text-navy-500 hover:text-navy-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to CLAN
        </Link>
      </div>
    </div>
  );
}