"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type SubscribeResult = {
  error?: string;
  success?: boolean;
  confirmationUrl?: string;
  emailSent?: boolean;
};

export function NewsletterForm() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [emailIssue, setEmailIssue] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setEmailIssue(false);
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);

    try {
      const res = (await import("@/components/footer-actions").then((m) =>
        m.subscribeNewsletter(formData)
      )) as SubscribeResult;
      setSubmitting(false);

      if (res.error) {
        setError(res.error as string);
        return;
      }

      if (res.confirmationUrl) {
        setSubmitted(true);
        router.push(res.confirmationUrl as string);
        return;
      }

      // Success but no confirmation URL: email could not be delivered.
      if (res.emailSent === false) {
        setEmailIssue(true);
      }
      setSubmitted(true);
    } catch {
      setSubmitting(false);
      setError("Something went wrong. Please try again.");
    }
  }

  if (submitted) {
    return (
      <div className="mt-4 space-y-2">
        <p className="rounded-lg border border-green-800 bg-green-900/30 px-4 py-3 text-sm text-green-300">
          Thank you! Please check your inbox to confirm your subscription.
        </p>
        {emailIssue && (
          <p className="rounded-lg border border-amber-800 bg-amber-900/30 px-4 py-3 text-sm text-amber-300">
            The confirmation email could not be sent right now. Please try again shortly, or contact the
            site administrator if the issue persists.
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <div>
        <input
          type="text"
          name="name"
          required
          placeholder="Your name"
          aria-label="Full name"
          className="w-full rounded-lg border border-navy-600 bg-navy-900 px-4 py-2.5 text-sm text-white placeholder:text-navy-400 focus:border-gold-400 focus:outline-none"
        />
      </div>
      <div>
        <input
          type="email"
          name="email"
          required
          placeholder="Your email"
          aria-label="Email address"
          className="w-full rounded-lg border border-navy-600 bg-navy-900 px-4 py-2.5 text-sm text-white placeholder:text-navy-400 focus:border-gold-400 focus:outline-none"
        />
      </div>
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-gold-500 px-4 py-2.5 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold-600 disabled:opacity-60"
      >
        {submitting ? "Subscribing..." : "Subscribe"}
      </button>
    </form>
  );
}