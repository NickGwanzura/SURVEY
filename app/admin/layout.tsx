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

  // The /admin/login page is excluded from auth here by checking inside its
  // own layout group; middleware also handles redirect-when-logged-in.
  if (!admin) {
    return <>{children}</>;
  }

  return (
    <AdminProviders>
      <div className="flex min-h-screen flex-col bg-slate-50 lg:flex-row">
        <AdminSidebar
          user={{
            name: admin.user.name,
            email: admin.user.email,
            role: admin.user.role,
          }}
        />

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
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
