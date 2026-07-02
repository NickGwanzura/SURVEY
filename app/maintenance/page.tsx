import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Under Maintenance · ZW RAC Registry",
};

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md text-center">
        {/* Logo / icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600">
          <svg
            width="32"
            height="32"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden
          >
            <path
              d="M10 2L3 6v8l7 4 7-4V6l-7-4z"
              stroke="white"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M10 2v12M3 6l7 4 7-4"
              stroke="white"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Under Maintenance
        </h1>

        <p className="mt-3 text-base leading-relaxed text-slate-600">
          The RAC Technician Registry is currently undergoing scheduled
          maintenance. We&rsquo;ll be back shortly.
        </p>

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-center gap-3">
            <span className="h-3 w-3 animate-pulse rounded-full bg-amber-400" />
            <span className="text-sm font-medium text-slate-700">
              Maintenance in progress
            </span>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            If you are an administrator, you can{" "}
            <a
              href="/admin/login"
              className="font-medium text-brand-600 underline-offset-4 hover:underline"
            >
              sign in here
            </a>
            .
          </p>
        </div>

        <p className="mt-8 text-xs text-slate-400">
          National Ozone Unit of Zimbabwe · HEVACRAZ
        </p>
      </div>
    </div>
  );
}
