import { Suspense } from "react";
import { CheckCircle2, AlertTriangle, Clock, XCircle, MailCheck } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return [];
}

export default async function NewsletterConfirmPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  const params = await searchParams;
  const status = String(params.status || "invalid");

  const states: Record<
    string,
    { icon: React.ReactNode; title: string; message: string; buttonLabel: string; buttonHref: string }
  > = {
    success: {
      icon: <CheckCircle2 className="h-12 w-12 text-green-500" />,
      title: "Subscription Confirmed",
      message:
        "Thank you for confirming your subscription to the CLAN newsletter. You are now part of the CLAN community and will receive our latest updates, resources, encouragement, events and opportunities to grow in Christ.",
      buttonLabel: "Return to CLAN",
      buttonHref: "/",
    },
    already: {
      icon: <MailCheck className="h-12 w-12 text-blue-500" />,
      title: "Subscription Already Confirmed",
      message:
        "Your subscription is already active. You're all set to receive updates from CLAN.",
      buttonLabel: "Return to CLAN",
      buttonHref: "/",
    },
    expired: {
      icon: <Clock className="h-12 w-12 text-amber-500" />,
      title: "Confirmation Link Expired",
      message:
        "This confirmation link has expired. Please request a new confirmation email, or contact us if you need help.",
      buttonLabel: "Resend Confirmation",
      buttonHref: "/newsletter/resend",
    },
    invalid: {
      icon: <AlertTriangle className="h-12 w-12 text-red-500" />,
      title: "Invalid Confirmation Link",
      message:
        "This confirmation link is invalid. Please check the link you received, or subscribe again if needed.",
      buttonLabel: "Subscribe",
      buttonHref: "/",
    },
    error: {
      icon: <XCircle className="h-12 w-12 text-red-500" />,
      title: "Something Went Wrong",
      message:
        "We couldn't confirm your subscription at this time. Please try again shortly, or contact us for assistance.",
      buttonLabel: "Return to CLAN",
      buttonHref: "/",
    },
  };

  const state = states[status] || states.invalid;

  return (
    <Suspense fallback={null}>
      <div className="flex min-h-[70vh] items-center justify-center bg-navy-50/30 px-4 py-16">
        <div className="w-full max-w-lg rounded-2xl border border-navy-100 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-navy-50">
            {state.icon}
          </div>
          <h1 className="mt-6 font-display text-3xl font-bold text-navy-900">{state.title}</h1>
          <p className="mx-auto mt-4 max-w-md text-navy-600">{state.message}</p>
          <Link
            href={state.buttonHref}
            className="mt-8 inline-block rounded-lg bg-navy-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-navy-800"
          >
            {state.buttonLabel}
          </Link>
        </div>
      </div>
    </Suspense>
  );
}