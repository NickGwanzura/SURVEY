import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Offline — RAC Technician Registry",
  robots: { index: false, follow: false },
};

const TIPS = [
  {
    title: "Photos still capture",
    body: "They will be uploaded automatically when you reconnect.",
  },
  {
    title: "GPS works offline",
    body: "Your location is saved with your response.",
  },
  {
    title: "Move to better signal",
    body: "Open areas and windows help your phone reconnect and sync.",
  },
];

export default function OfflinePage() {
  return (
    <div className="flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-3xl border border-amber-200 bg-white p-7 shadow-sm sm:p-9">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-amber-200/50 blur-3xl"
          aria-hidden
        />
        <div className="relative">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-sm ring-1 ring-amber-200" aria-hidden>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <path d="M4.5 14a8.5 8.5 0 0 1 14.4-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M21 14a8.5 8.5 0 0 1-14.4 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M3 3l20 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
          <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-[34px]">
            You are offline
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-600">
            Don&rsquo;t worry — you can still complete the survey. Your answers
            are saved on this device. As soon as your phone reconnects, your
            response will be sent automatically.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
          Tips for working offline
        </h2>
        <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {TIPS.map((tip) => (
            <li
              key={tip.title}
              className="flex flex-col gap-1 rounded-xl border border-slate-100 bg-slate-50/60 p-3"
            >
              <span className="text-sm font-semibold text-slate-900">
                {tip.title}
              </span>
              <span className="text-xs leading-relaxed text-slate-600">
                {tip.body}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/survey" className="sm:inline-block">
          <Button size="lg" className="w-full sm:w-auto">
            Continue with the survey
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Button>
        </Link>
        <Link href="/" className="sm:inline-block">
          <Button variant="ghost" size="lg" className="w-full sm:w-auto">
            Back to home
          </Button>
        </Link>
      </div>
    </div>
  );
}
