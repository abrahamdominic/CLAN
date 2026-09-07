"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[error-boundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-3xl font-bold text-navy-900">
        Something went wrong
      </h1>
      <p className="mt-4 max-w-md text-navy-600">
        An unexpected error occurred. Please try again or contact support if the
        problem persists.
      </p>
      <button
        onClick={reset}
        className="mt-8 rounded-lg bg-gold-500 px-6 py-3 font-semibold text-navy-950 hover:bg-gold-600"
      >
        Try Again
      </button>
    </div>
  );
}
