import Link from "next/link";

import { PublicProviders } from "./PublicProviders";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicProviders>
      <div className="flex min-h-screen flex-col">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
            <Link
              href="/"
              className="flex flex-col leading-tight text-slate-900"
            >
              <span className="text-xs font-medium uppercase tracking-wide text-brand-600">
                Zimbabwe NOU · HEVACRAZ
              </span>
              <span className="text-base font-semibold">
                RAC Technician Registry
              </span>
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:py-8">
          {children}
        </main>

        <footer className="border-t border-slate-200 bg-white px-4 py-4 text-center text-xs text-slate-500">
          National Ozone Unit of Zimbabwe and HEVACRAZ ·{" "}
          <Link
            href="/survey/offline"
            className="text-brand-600 underline-offset-2 hover:underline"
          >
            Offline help
          </Link>
        </footer>
      </div>
    </PublicProviders>
  );
}
