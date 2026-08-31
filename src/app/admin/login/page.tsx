"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "@/app/actions";
import { Logo } from "@/components/logo";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const result = await adminLogin(fd);
    if (result.error) {
      toast.error(result.error);
      setLoading(false);
    } else {
      router.push("/admin");
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Logo className="justify-center [&_span]:text-white [&_span_span]:text-gold-400" textClassName="[&_span]:text-white [&_span_span]:text-gold-400" />
          <p className="mt-3 text-sm text-navy-300">Sign in to the admin dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-8 shadow-xl">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-navy-700">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-navy-200 px-4 py-2.5 text-sm text-navy-900 placeholder:text-navy-400 focus:border-gold-400 focus:outline-none"
              placeholder="admin@clanministry.org"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-navy-700">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-navy-200 px-4 py-2.5 text-sm text-navy-900 placeholder:text-navy-400 focus:border-gold-400 focus:outline-none"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-navy-900 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-800 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
