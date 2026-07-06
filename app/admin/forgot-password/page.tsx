"use client";

import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setError(json?.error ?? "Something went wrong.");
        setSubmitting(false);
        return;
      }
      setSent(true);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  if (sent) {
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
            <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-sidebar-text-muted">NOU · HEVACRAZ</p>
            <h2 className="mt-1 text-2xl font-semibold leading-tight text-white">RAC Technician Registry</h2>
            <p className="mt-1 text-sm text-sidebar-text-muted">Admin Portal</p>
          </div>
          <p className="text-xs leading-relaxed text-sidebar-text-muted">Restricted to authorised staff. Unauthorised access is prohibited.</p>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-12">
          <div className="w-full max-w-sm text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-brand-600">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M7.5 12l3 3 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-slate-900">Check your email</h1>
            <p className="mt-2 text-sm text-slate-600">
              If an account exists with that email address, we&apos;ve sent a password reset link. It expires in 2 hours.
            </p>
            <Link href="/admin/login" className="mt-6 inline-block text-sm font-medium text-brand-600 hover:underline">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
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
          <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-sidebar-text-muted">NOU · HEVACRAZ</p>
          <h2 className="mt-1 text-2xl font-semibold leading-tight text-white">RAC Technician Registry</h2>
          <p className="mt-1 text-sm text-sidebar-text-muted">Admin Portal</p>
        </div>
        <p className="text-xs leading-relaxed text-sidebar-text-muted">Restricted to authorised staff. Unauthorised access is prohibited.</p>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600">NOU · HEVACRAZ — Admin</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">Forgot your password?</h1>
            <p className="mt-1 text-sm text-slate-500">Enter your email address and we&apos;ll send you a reset link.</p>
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

            {error ? (
              <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="mt-0.5 shrink-0 text-red-600">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 4.5v4M8 10v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            ) : null}

            <Button type="submit" size="lg" loading={submitting} className="mt-2">
              Send reset link
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Remember your password?{" "}
            <Link href="/admin/login" className="font-medium text-brand-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
