"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { PROVINCES, PROVINCE_LABELS } from "@/lib/constants/provinces";

const AVAILABLE_FIELDS = [
  { key: "firstName", label: "First Name" },
  { key: "surname", label: "Surname" },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "province", label: "Province" },
  { key: "city", label: "City" },
  { key: "suburb", label: "Suburb" },
  { key: "gender", label: "Gender" },
  { key: "ageGroup", label: "Age Group" },
  { key: "educationLevel", label: "Education" },
  { key: "yearsExperience", label: "Experience" },
  { key: "mainWorkFocus", label: "Work Focus" },
  { key: "hasCertification", label: "Certification" },
  { key: "hasFormalTraining", label: "Formal Training" },
  { key: "confidenceTraditionalRefrigerants", label: "Trad. Confidence" },
  { key: "confidenceLowGwpRefrigerants", label: "Low-GWP Confidence" },
  { key: "status", label: "Status" },
  { key: "submittedAt", label: "Submitted" },
  { key: "submissionSource", label: "Source" },
  { key: "consentToContact", label: "Consent Contact" },
  { key: "consentToPublicRegistry", label: "Consent Registry" },
  { key: "installsEnergyEfficient", label: "Energy Efficient" },
];

const GROUP_BY_OPTIONS = [
  { key: "none", label: "No grouping" },
  { key: "province", label: "Province" },
  { key: "gender", label: "Gender" },
  { key: "ageGroup", label: "Age Group" },
  { key: "educationLevel", label: "Education Level" },
  { key: "yearsExperience", label: "Years Experience" },
  { key: "hasCertification", label: "Certification" },
  { key: "status", label: "Status" },
  { key: "submissionSource", label: "Source" },
];

export default function ReportBuilderPage() {
  const [selectedFields, setSelectedFields] = useState<string[]>([
    "firstName",
    "surname",
    "province",
    "status",
    "submittedAt",
  ]);
  const [groupBy, setGroupBy] = useState("none");
  const [status, setStatus] = useState("");
  const [province, setProvince] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Record<string, unknown>[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleField = useCallback((key: string) => {
    setSelectedFields((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }, []);

  const runReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      selectedFields.forEach((f) => params.append("fields", f));
      if (groupBy !== "none") params.set("groupBy", groupBy);
      if (status) params.set("status", status);
      if (province) params.set("province", province);

      const res = await fetch(`/api/admin/report-builder?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch report");
      const data = await res.json();
      setResults((data.results as Record<string, unknown>[]) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Custom Report Builder
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Select fields, filters, and groupings to build your own report
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Config panel */}
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Fields</h2>
            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_FIELDS.map((f) => (
                <label
                  key={f.key}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2 text-xs transition-colors ${
                    selectedFields.includes(f.key)
                      ? "border-brand-600 bg-brand-50 text-slate-900"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedFields.includes(f.key)}
                    onChange={() => toggleField(f.key)}
                    className="accent-brand-600"
                  />
                  {f.label}
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">
              Group By
            </h2>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-2 focus:outline-brand-600"
            >
              {GROUP_BY_OPTIONS.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">
              Filters
            </h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-2 focus:outline-brand-600"
                >
                  <option value="">All</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="flagged">Flagged</option>
                  <option value="duplicate">Duplicate</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Province
                </label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-2 focus:outline-brand-600"
                >
                  <option value="">All</option>
                  {PROVINCES.map((p) => (
                    <option key={p} value={p}>
                      {PROVINCE_LABELS[p]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <Button
            type="button"
            loading={loading}
            onClick={runReport}
            className="w-full"
          >
            Run Report
          </Button>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        {/* Results panel */}
        <div className="lg:col-span-2">
          {results === null ? (
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-sm text-slate-400">
              Select fields and click Run Report to see results
            </div>
          ) : results.length === 0 ? (
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-sm text-slate-400">
              No results match your criteria
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    {groupBy !== "none" && (
                      <th className="px-4 py-3">
                        {GROUP_BY_OPTIONS.find((o) => o.key === groupBy)
                          ?.label ?? groupBy}
                      </th>
                    )}
                    {selectedFields.map((f) => (
                      <th key={f} className="px-4 py-3">
                        {AVAILABLE_FIELDS.find((af) => af.key === f)?.label ??
                          f}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      {groupBy !== "none" && (
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {String(row._groupKey ?? "—")}
                        </td>
                      )}
                      {selectedFields.map((f) => (
                        <td key={f} className="px-4 py-3 text-slate-700">
                          {Array.isArray(row[f])
                            ? (row[f] as unknown[]).join(", ")
                            : String(row[f] ?? "—")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
