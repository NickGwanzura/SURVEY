import Link from "next/link";

import { Button } from "@/components/ui/Button";

type SearchParams = Promise<{ ref?: string; offline?: string }>;

export const metadata = {
  title: "Thank you — RAC Technician Registry",
};

export default async function RetailerCompletePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const reference = params.ref;
  const isOffline = params.offline === "1";

  const heading = isOffline
    ? "Saved on your device"
    : "Thank you for your submission";
  const description = isOffline
    ? "You are currently offline. Your response is stored on this device and will sync automatically when you reconnect."
    : "Your supplier/retailer survey has been received. The NOU and HEVACRAZ teams will review your submission.";

  return (
    <div className="flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-white p-7 shadow-sm sm:p-9">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-200/40 blur-3xl"
          aria-hidden
        />
        <div className="relative">
          <span
            className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm ring-1 ${
              isOffline
                ? "bg-amber-50 text-amber-600 ring-amber-200"
                : "bg-emerald-50 text-emerald-600 ring-emerald-200"
            }`}
            aria-hidden
          >
            {isOffline ? (
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                <path
                  d="M13 7v7M13 17v.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle
                  cx="13"
                  cy="13"
                  r="10.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
              </svg>
            ) : (
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path
                  d="M7 14.5l4 4 10-10"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>

          <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-[34px]">
            {heading}
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-600">
            {description}
          </p>

          {!isOffline && reference ? (
            <div className="mt-6 inline-flex flex-col items-start gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-emerald-700">
                Reference number
              </span>
              <span className="font-mono text-lg tracking-wider text-emerald-900">
                {reference}
              </span>
              <span className="text-xs text-emerald-700/80">
                Keep this for your records.
              </span>
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
          What happens next?
        </h2>
        <ol className="mt-4 flex flex-col gap-3">
          {[
            "NOU and HEVACRAZ will review your submission.",
            "You may be contacted for verification or to discuss training opportunities.",
            "Your input helps shape policy on refrigerant access and technician support.",
          ].map((step, i) => (
            <li key={step} className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700 ring-1 ring-brand-100">
                {i + 1}
              </span>
              <p className="pt-0.5 text-sm leading-relaxed text-slate-700">
                {step}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/" className="sm:inline-block">
          <Button variant="secondary" size="lg" className="w-full sm:w-auto">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden
            >
              <path
                d="M11 7H3M7 3L3 7l4 4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back to home
          </Button>
        </Link>
      </div>
    </div>
  );
}
