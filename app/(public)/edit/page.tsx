"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { ZIMBABWE_PHONE_REGEX } from "@/lib/validation";

export default function EditLookupPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!ZIMBABWE_PHONE_REGEX.test(phone)) {
      setError("Enter a valid Zimbabwe phone number (+263 followed by 9 digits).");
      return;
    }
    if (!referenceNumber.trim()) {
      setError("Reference number is required.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/survey/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, referenceNumber }),
      });

      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(json?.error ?? "Lookup failed. Please try again.");
        setLoading(false);
        return;
      }

      const data = (await res.json()) as Record<string, unknown>;
      sessionStorage.setItem(
        "surveyEditState",
        JSON.stringify({ id: data.id as string, phone, data }),
      );
      router.push("/survey/edit");
    } catch {
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold text-slate-900">
          Edit your application
        </h1>
        <p className="mt-2 text-slate-600">
          Enter the phone number and reference number from your confirmation
          email to retrieve and edit your submission.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label
              htmlFor="edit-phone"
              className="block text-sm font-medium text-slate-700"
            >
              Phone number
            </label>
            <input
              id="edit-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+263771234567"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              required
            />
          </div>

          <div>
            <label
              htmlFor="edit-ref"
              className="block text-sm font-medium text-slate-700"
            >
              Reference number
            </label>
            <input
              id="edit-ref"
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="e.g. A1B2C3D4"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              required
            />
            <p className="mt-1 text-xs text-slate-500">
              This is the 8-character code from your confirmation email.
            </p>
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? "Looking up…" : "Find my application"}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-slate-500">
        Don&apos;t have your reference number?{" "}
        <a
          href="mailto:nou@environment.gov.zw"
          className="font-medium text-brand-600 underline-offset-4 hover:underline"
        >
          Contact support
        </a>
      </p>
    </div>
  );
}
