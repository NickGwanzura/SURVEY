"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

function DashboardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <rect x="1.5" y="1.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="1.5" y="10.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="10.5" y="1.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="10.5" y="10.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function ResponsesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M3 2.5h12a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 6.5h8M5 9h8M5 11.5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M9 1.5A5.5 5.5 0 0 1 14.5 7c0 4-5.5 9.5-5.5 9.5S3.5 11 3.5 7A5.5 5.5 0 0 1 9 1.5z" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="9" cy="7" r="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function TechniciansDirectoryIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M3.5 4.5h11a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 8h6M6 10.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6.25 6.5h.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function InsightsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M2 14l4-5 3 2 3-5 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 16.5h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ComparisonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <rect x="2.5" y="10.5" width="4" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="7" y="6" width="4" height="9.5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11.5" y="1.5" width="4" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function PeriodComparisonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <rect x="2" y="3" width="6" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="10" y="3" width="6" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 7.5h2M5 10.5h2M12 7.5h2M12 10.5h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function BuilderIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M3 10.5l4-4 3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 14.5h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function FunnelIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M2 3.5h14l-5.5 7v4.5l-3 1.5V10.5L2 3.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ExportIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M9 2v9M6 8l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 12v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function DuplicateIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <rect x="3.5" y="3.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9.5" y="3.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3.5" y="9.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function CoverageIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M1.5 4.5l6-3 3 1.5 6-3v12l-6 3-3-1.5-6 3V4.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 3v12M13.5 1.5V13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function RegistryIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M3.5 4.5h11a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 8h6M6 10.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6.25 6.5h.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function SignOutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <path d="M6 1.5H2.5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1H6M10 10.5l3-3-3-3M13.5 7.5H5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M2.5 5h13M2.5 9h13M2.5 13h13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <circle cx="9" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M1.5 16c0-3.038 3.358-5.5 7.5-5.5s7.5 2.462 7.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", Icon: DashboardIcon },
  { href: "/admin/responses", label: "Responses", Icon: ResponsesIcon },
  { href: "/admin/map", label: "Map", Icon: MapIcon },
  { href: "/admin/technicians", label: "Technicians directory", Icon: TechniciansDirectoryIcon },
  { href: "/admin/insights", label: "Insights", Icon: InsightsIcon },
  { href: "/admin/provinces", label: "Province Comparison", Icon: ComparisonIcon },
  { href: "/admin/comparison", label: "Period Comparison", Icon: PeriodComparisonIcon },
  { href: "/admin/report-builder", label: "Report Builder", Icon: BuilderIcon },
  { href: "/admin/funnel", label: "Survey Funnel", Icon: FunnelIcon },
  { href: "/admin/export", label: "Export", Icon: ExportIcon },
  { href: "/admin/duplicates", label: "Duplicates", Icon: DuplicateIcon },
  { href: "/admin/coverage", label: "Coverage Gap", Icon: CoverageIcon },
  { href: "/admin/registry-preview", label: "Registry Preview", Icon: RegistryIcon },
  { href: "/admin/users", label: "Admin Users", Icon: UsersIcon },
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

  const logoBlock = (
    <Link href="/admin/dashboard" className="flex flex-col leading-tight">
      <span className="text-[10px] font-bold uppercase tracking-widest text-sidebar-text-muted">
        NOU · HEVACRAZ
      </span>
      <span className="mt-0.5 text-base font-semibold text-white">
        RAC Registry
      </span>
      <span className="text-xs text-sidebar-text-muted">Admin Portal</span>
    </Link>
  );

  return (
    <>
      {/* Mobile top bar */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5 leading-tight">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M8 1.5L1.5 5v6L8 14.5l6.5-3.5V5L8 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M8 1.5v7M1.5 5l6.5 3.5 6.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-600">NOU · HEVACRAZ</span>
            <span className="text-sm font-semibold text-slate-900">RAC Registry — Admin</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {mobileOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </header>

      {/* Overlay for mobile */}
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      ) : null}

      {/* Sidebar */}
      <aside
        className={cn(
          "z-40 flex flex-col",
          "lg:sticky lg:top-0 lg:h-screen lg:w-64",
          "bg-sidebar-bg",
          mobileOpen
            ? "fixed inset-y-0 left-0 w-72 translate-x-0 transition-transform duration-200"
            : "fixed inset-y-0 left-0 w-72 -translate-x-full transition-transform duration-200 lg:relative lg:translate-x-0",
        )}
        aria-label="Admin navigation"
      >
        {/* Logo */}
        <div className="flex items-center justify-between border-b border-sidebar-border px-5 py-5">
          {logoBlock}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-sidebar-text-muted hover:bg-sidebar-active hover:text-white lg:hidden"
            aria-label="Close navigation menu"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4" aria-label="Admin pages">
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const active =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-active text-white"
                    : "text-sidebar-text hover:bg-sidebar-active/60 hover:text-white",
                )}
                aria-current={active ? "page" : undefined}
              >
                <span className={cn(active ? "text-brand-300" : "text-sidebar-text-muted")}>
                  <Icon />
                </span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="border-t border-sidebar-border px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-active text-xs font-bold text-brand-300">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{user.name}</p>
              <p className="truncate text-xs text-sidebar-text-muted">{user.email}</p>
            </div>
          </div>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-brand-300">
            {user.role.replace("_", " ")}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            loading={loggingOut}
            className="mt-3 w-full justify-start text-sidebar-text hover:bg-sidebar-active hover:text-white"
          >
            <SignOutIcon />
            Sign out
          </Button>
        </div>
      </aside>
    </>
  );
}
