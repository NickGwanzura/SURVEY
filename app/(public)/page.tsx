import Link from "next/link";

import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-5">
      <section className="overflow-hidden rounded-2xl border border-brand-200 bg-brand-600 shadow-sm">
        <div className="p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-200">
            National Ozone Unit · HEVACRAZ
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
            Zimbabwe RAC Technician Self-Registration
          </h1>
          <p className="mt-3 text-base leading-relaxed text-brand-100">
            Help build the National HVAC-R Technician Registry. Your responses
            inform training programmes, regulation, and Montreal Protocol
            compliance reporting in Zimbabwe.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 text-sm text-brand-100">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 4.5v4l2.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              10–15 minutes
            </div>
            <div className="flex items-center gap-2 text-sm text-brand-100">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M2 8c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M2 8l1 1 1-1M12 8l1 1 1-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Works offline
            </div>
            <div className="flex items-center gap-2 text-sm text-brand-100">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M13 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M5 8h6M5 5.5h6M5 10.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Save and continue
            </div>
          </div>

          <Link href="/survey" className="mt-6 inline-block">
            <Button size="lg" variant="inverse">
              Start the survey
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Button>
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="text-brand-600">
              <path d="M8 1.5A6.5 6.5 0 1 1 1.5 8 6.507 6.507 0 0 1 8 1.5zM8 5v3.5l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-sm font-semibold text-slate-900">What you will need</h2>
          <ul className="mt-2 flex flex-col gap-2">
            {[
              "Full name as on your ID",
              "Zimbabwe phone number (+263)",
              "Training and certification details",
              "Optional: a profile photo",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="text-brand-600">
              <path d="M8 1a5 5 0 0 1 5 5c0 3-5 9-5 9S3 9 3 6a5 5 0 0 1 5-5z" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
          <h2 className="text-sm font-semibold text-slate-900">Privacy &amp; data use</h2>
          <ul className="mt-2 flex flex-col gap-2">
            {[
              "Only NOU and HEVACRAZ staff can view your full record",
              "Public registry shows name and certification only with your consent",
              "You may request deletion at any time",
              "No third-party trackers or marketing analytics",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
        <p className="text-xs leading-relaxed text-slate-500">
          Information collected by the National Ozone Unit (NOU) and HEVACRAZ for building the
          National HVAC-R Technician Registry, designing training programmes, and preparing policy
          reports under the Montreal Protocol and Kigali Amendment.
        </p>
      </div>
    </div>
  );
}
