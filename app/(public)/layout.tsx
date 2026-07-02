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
            >
              <img
                src="/logo.jpeg"
                alt="Ministry of Environment, Climate and Wildlife — Government of Zimbabwe"
                className="h-10 w-10 rounded-full object-cover shrink-0"
              />
              <span className="h-7 w-px bg-slate-200 shrink-0" aria-hidden />
              <img
                src="/logo2.jpeg"
                alt="HEVACRAZ — Heating, Ventilation, Air Conditioning & Refrigeration Association of Zimbabwe"
                className="h-10 w-10 rounded-full object-cover shrink-0"
              />
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

        <main className="w-full flex-1">
          {children}
        </main>

        <footer className="border-t border-slate-200/80 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.jpeg" alt="Government of Zimbabwe" className="h-8 w-8 rounded-full object-cover" />
              <img src="/logo2.jpeg" alt="HEVACRAZ" className="h-8 w-8 rounded-full object-cover" />
              <div className="text-xs text-slate-500 leading-snug">
                <p className="font-semibold text-slate-700">National Ozone Unit · HEVACRAZ</p>
                <p>Government of Zimbabwe</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
              <Link href="/survey/offline" className="hover:text-brand-600 transition-colors">Offline help</Link>
              <span aria-hidden className="text-slate-300">·</span>
              <Link href="/privacy-notice" className="hover:text-brand-600 transition-colors">Privacy notice</Link>
              <span aria-hidden className="text-slate-300">·</span>
              <Link href="/admin/login" className="hover:text-brand-600 transition-colors">Staff sign in</Link>
              <span aria-hidden className="text-slate-300">·</span>
              <a href="https://spiritusglobal.tech" target="_blank" rel="noopener noreferrer" className="hover:text-brand-600 transition-colors">Developed and Maintained by SPIRITUS GLOBAL</a>
            </div>
          </div>
        </footer>
      </div>
    </PublicProviders>
  );
}
