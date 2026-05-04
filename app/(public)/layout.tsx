import Link from "next/link";

import { PublicProviders } from "./PublicProviders";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicProviders>
      <div className="public-shell flex min-h-screen flex-col">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur-md supports-[backdrop-filter]:bg-white/70">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
            <Link
              href="/"
              className="flex items-center gap-3 leading-tight text-slate-900"
              aria-label="Home — RAC Technician Registry"
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white"
                aria-hidden
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                  <path
                    d="M10 2L3 6v8l7 4 7-4V6l-7-4z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <path
                    d="M10 2v12M3 6l7 4 7-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-xs font-semibold uppercase tracking-widest text-brand-600">
                  Zimbabwe NOU · HEVACRAZ
                </span>
                <span className="text-sm font-semibold text-slate-900">
                  RAC Technician Registry
                </span>
              </span>
            </Link>
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
                <path d="M6.5 7.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" stroke="currentColor" strokeWidth="1.4" />
                <path d="M2 11.5c.7-1.8 2.5-3 4.5-3s3.8 1.2 4.5 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              Admin
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:py-10">
          {children}
        </main>

        <footer className="border-t border-slate-200/80 bg-white/60 backdrop-blur">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-2 px-4 py-5 text-center text-xs text-slate-500 sm:flex-row sm:justify-between sm:text-left">
            <p>National Ozone Unit of Zimbabwe · HEVACRAZ</p>
            <div className="flex items-center gap-3">
              <Link
                href="/survey/offline"
                className="font-medium text-brand-600 underline-offset-4 hover:underline"
              >
                Offline help
              </Link>
              <span aria-hidden className="text-slate-300">·</span>
              <Link href="/admin/login" className="hover:text-slate-700">
                Staff sign in
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </PublicProviders>
  );
}
