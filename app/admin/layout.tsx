import Link from "next/link";

import { getCurrentAdmin } from "@/lib/auth-server";

import { AdminProviders } from "./AdminProviders";
import { AdminSidebar } from "./AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return <>{children}</>;
  }

  return (
    <AdminProviders>
      {/* Skip-to-content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
      >
        Skip to main content
      </a>

      <div className="flex min-h-screen flex-col bg-slate-50 lg:flex-row">
        <AdminSidebar
          user={{
            name: admin.user.name,
            email: admin.user.email,
            role: admin.user.role,
          }}
        />

        <main id="main-content" className="min-w-0 flex-1 px-4 py-6 lg:px-8 lg:py-8 outline-none" tabIndex={-1}>
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>

        <noscript>
          <p className="px-4 py-2 text-xs text-slate-500">
            JavaScript is required to use the admin dashboard.{" "}
            <Link href="/" className="underline">
              Public site
            </Link>
          </p>
        </noscript>
      </div>
    </AdminProviders>
  );
}
