"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";

export function ContactForm() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const res = await import("@/app/actions").then((m) => m.submitContact(formData));
    setSubmitting(false);
    if ("error" in res && res.error) {
      toast.error(res.error as string);
      return;
    }
    setDone(true);
    formRef.current?.reset();
    toast.success("Message sent! We'll get back to you soon.");
  }

  if (done) {
    return (
      <div className="rounded-2xl bg-gold-50 p-10 text-center">
        <h3 className="font-display text-2xl font-bold text-navy-900">Message Received!</h3>
        <p className="mx-auto mt-3 max-w-md text-navy-600">
          Thank you for reaching out. Our team will respond to your message as soon as possible.
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="cname" className="mb-1 block text-sm font-medium text-navy-700">Name</label>
          <input id="cname" name="name" required className="w-full rounded-lg border border-navy-200 px-4 py-2.5 text-navy-900 focus:border-gold-500 focus:outline-none" />
        </div>
        <div>
          <label htmlFor="cemail" className="mb-1 block text-sm font-medium text-navy-700">Email</label>
          <input id="cemail" name="email" type="email" required className="w-full rounded-lg border border-navy-200 px-4 py-2.5 text-navy-900 focus:border-gold-500 focus:outline-none" />
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="cphone" className="mb-1 block text-sm font-medium text-navy-700">Phone <span className="text-navy-400">(optional)</span></label>
          <input id="cphone" name="phone" className="w-full rounded-lg border border-navy-200 px-4 py-2.5 text-navy-900 focus:border-gold-500 focus:outline-none" />
        </div>
        <div>
          <label htmlFor="csubject" className="mb-1 block text-sm font-medium text-navy-700">Subject</label>
          <input id="csubject" name="subject" className="w-full rounded-lg border border-navy-200 px-4 py-2.5 text-navy-900 focus:border-gold-500 focus:outline-none" />
        </div>
      </div>
      <div>
        <label htmlFor="cmessage" className="mb-1 block text-sm font-medium text-navy-700">Message</label>
        <textarea id="cmessage" name="message" required rows={6} className="w-full rounded-lg border border-navy-200 px-4 py-2.5 text-navy-900 focus:border-gold-500 focus:outline-none" />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-navy-800 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-navy-900 disabled:opacity-60"
      >
        {submitting ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
