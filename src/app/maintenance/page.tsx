import type { Metadata } from "next";
import { Logo } from "@/components/logo";
import { Wrench } from "lucide-react";

export const metadata: Metadata = {
  title: "Maintenance - Christian Life Altar Network",
  description: "The CLAN website is temporarily under maintenance. We will be back shortly.",
  robots: { index: false, follow: true },
};

export default function MaintenancePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-navy-950 px-6 py-16 text-center">
      <div className="w-full max-w-xl">
        <div className="flex justify-center">
          <div className="rounded-2xl bg-navy-900 p-3">
            <Logo textClassName="text-white" />
          </div>
        </div>

        <div className="mt-12 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gold-500/15">
          <Wrench className="h-8 w-8 text-gold-400" />
        </div>

        <h1 className="mt-6 font-display text-4xl font-bold text-white sm:text-5xl">
          We&rsquo;re Under Maintenance
        </h1>

        <p className="mx-auto mt-4 max-w-md text-lg text-navy-200">
          We&rsquo;re giving the site a little refresh. Please check back shortly &mdash; we&rsquo;ll be
          back online soon.
        </p>

        <p className="mx-auto mt-10 max-w-sm text-sm italic text-navy-400">
          &ldquo;Be still, and know that I am God.&rdquo;
          <span className="mt-1 block not-italic text-navy-300">
            Psalm 46:10
          </span>
        </p>
      </div>
    </main>
  );
}