"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-red-600">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
              <path d="M12 7v5M12 15.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Invalid Link</h1>
          <p className="mt-2 text-sm text-slate-600">
            No reset token was provided. Please use the full link from your email.
          </p>
          <Link href="/admin/login" className="mt-6 inline-block text-sm font-medium text-brand-600 hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(json?.error ?? "Reset failed. The link may have expired.");
        setSubmitting(false);
        return;
      }
      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-brand-600">
              <path d="M6 12.5l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Password Reset</h1>
          <p className="mt-2 text-sm text-slate-600">
            Your password has been changed successfully. All existing sessions have been signed out.
          </p>
          <Button className="mt-6" onClick={() => router.push("/admin/login")}>
            Sign in with new password
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-600">NOU · HEVACRAZ</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">Reset your password</h1>
          <p className="mt-1 text-sm text-slate-500">Choose a new password for your admin account.</p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <Field label="New password" required htmlFor="password">
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
          </Field>
          <Field label="Confirm new password" required htmlFor="confirm-password">
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
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
            Reset password
          </Button>
        </form>
      </div>
    </div>
  );
}
