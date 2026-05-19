"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";

export default function AdminLoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/admin/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(json?.error ?? "Login failed.");
        setSubmitting(false);
        return;
      }
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="hidden w-80 shrink-0 flex-col justify-between bg-sidebar-bg p-8 lg:flex">
        <div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path d="M10 2L3 6v8l7 4 7-4V6l-7-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
              <path d="M10 2v12M3 6l7 4 7-4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-sidebar-text-muted">
            NOU · HEVACRAZ
          </p>
          <h2 className="mt-1 text-2xl font-semibold leading-tight text-white">
            RAC Technician Registry
          </h2>
          <p className="mt-1 text-sm text-sidebar-text-muted">Admin Portal</p>
        </div>
        <div className="space-y-3">
          <p className="text-xs leading-relaxed text-sidebar-text-muted">
            Restricted to authorised National Ozone Unit and HEVACRAZ staff. Unauthorised access is prohibited.
          </p>
          <div className="h-px bg-sidebar-border" />
          <p className="text-xs text-sidebar-text-muted">
            Montreal Protocol compliance data — Zimbabwe
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600">
              NOU · HEVACRAZ — Admin
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">
              Sign in to your account
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Restricted access for authorised staff only.
            </p>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <Field label="Email" required htmlFor="email">
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </Field>
            <Field label="Password" required htmlFor="password">
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </Field>

            <div className="-mt-2 text-right">
              <Link
                href="/admin/forgot-password"
                className="text-xs font-medium text-brand-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {error ? (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="mt-0.5 shrink-0 text-red-600">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 4.5v4M8 10v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            ) : null}

            <Button type="submit" size="lg" loading={submitting} className="mt-2">
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
