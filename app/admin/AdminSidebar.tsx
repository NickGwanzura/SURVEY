"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/admin/responses", label: "Responses", icon: "📋" },
  { href: "/admin/map", label: "Map", icon: "🗺️" },
  { href: "/admin/insights", label: "Insights", icon: "📈" },
  { href: "/admin/export", label: "Export", icon: "⬇️" },
];

type AdminSidebarProps = {
  user: { name: string; email: string; role: string };
};

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <>
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <Link href="/admin/dashboard" className="flex flex-col leading-tight">
          <span className="text-xs font-medium uppercase tracking-wide text-brand-600">
            NOU · HEVACRAZ
          </span>
          <span className="text-base font-semibold">RAC Registry — Admin</span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="rounded-md border border-slate-300 px-3 py-1 text-sm"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? "Close" : "Menu"}
        </button>
      </header>

      <aside
        className={cn(
          "border-slate-200 bg-white",
          "lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:border-r",
          mobileOpen ? "block" : "hidden lg:block",
        )}
      >
        <div className="hidden flex-col gap-1 px-4 pb-2 pt-6 lg:flex">
          <Link href="/admin/dashboard" className="flex flex-col leading-tight">
            <span className="text-xs font-medium uppercase tracking-wide text-brand-600">
              NOU · HEVACRAZ
            </span>
            <span className="text-base font-semibold">
              RAC Registry — Admin
            </span>
          </Link>
        </div>

        <nav className="flex flex-col gap-0.5 px-2 py-2 lg:py-4">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-700 hover:bg-slate-100",
                )}
              >
                <span aria-hidden>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 px-4 py-4">
          <p className="text-sm font-medium text-slate-900">{user.name}</p>
          <p className="text-xs text-slate-500">{user.email}</p>
          <p className="mt-0.5 text-xs uppercase tracking-wide text-brand-600">
            {user.role.replace("_", " ")}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            loading={loggingOut}
            className="mt-3 w-full justify-start"
          >
            Sign out
          </Button>
        </div>
      </aside>
    </>
  );
}
