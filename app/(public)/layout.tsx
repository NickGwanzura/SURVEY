import Link from "next/link";
import Image from "next/image";

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
              <Image
                src="/logo.jpeg"
                alt="Ministry of Environment, Climate and Wildlife — Government of Zimbabwe"
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover shrink-0"
              />
              <span className="h-7 w-px bg-slate-200 shrink-0" aria-hidden />
              <Image
                src="/logo2.jpeg"
                alt="HEVACRAZ — Heating, Ventilation, Air Conditioning & Refrigeration Association of Zimbabwe"
                width={40}
                height={40}
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

        <footer className="mt-12 border-t border-slate-800 bg-slate-950 text-slate-300">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 sm:grid-cols-2 sm:px-8 sm:py-12 lg:grid-cols-[1.5fr_1fr_1fr]">
            <div>
              <Link href="/" className="inline-flex items-center gap-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300">
                <Image src="/logo.jpeg" alt="" width={44} height={44} className="h-11 w-11 rounded-full object-cover ring-2 ring-white/15" />
                <Image src="/logo2.jpeg" alt="" width={44} height={44} className="h-11 w-11 rounded-full object-cover ring-2 ring-white/15" />
                <span>
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-200">Zimbabwe NOU · HEVACRAZ</span>
                  <span className="mt-1 block text-sm font-semibold text-white">RAC Technician Registry</span>
                </span>
              </Link>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
                A national directory supporting skilled, verified refrigeration and air-conditioning professionals across Zimbabwe.
              </p>
            </div>

            <nav aria-label="Registry links">
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-white">Explore</h2>
              <ul className="mt-4 space-y-3 text-sm">
                <li><Link href="/survey" className="transition-colors hover:text-white focus-visible:text-white">Register as a technician</Link></li>
                <li><Link href="/registry" className="transition-colors hover:text-white focus-visible:text-white">Public technician registry</Link></li>
                <li><Link href="/edit" className="transition-colors hover:text-white focus-visible:text-white">Manage your application</Link></li>
              </ul>
            </nav>

            <nav aria-label="Help and policies">
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-white">Help &amp; information</h2>
              <ul className="mt-4 space-y-3 text-sm">
                <li><Link href="/survey/offline" className="transition-colors hover:text-white focus-visible:text-white">Offline help</Link></li>
                <li><Link href="/privacy-notice" className="transition-colors hover:text-white focus-visible:text-white">Privacy notice</Link></li>
                <li><a href="mailto:nou@environment.gov.zw" className="transition-colors hover:text-white focus-visible:text-white">Contact the National Ozone Unit</a></li>
                <li><Link href="/admin/login" className="transition-colors hover:text-white focus-visible:text-white">Staff sign in</Link></li>
              </ul>
            </nav>
          </div>
          <div className="border-t border-white/10">
            <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <p>© {new Date().getFullYear()} National Ozone Unit · Ministry of Environment, Climate and Wildlife, Zimbabwe</p>
              <a href="https://spiritusglobal.tech" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-slate-300">Digital services by SPIRITUS GLOBAL</a>
            </div>
          </div>
        </footer>
      </div>
    </PublicProviders>
  );
}
