"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { PROVINCES, PROVINCE_LABELS } from "@/lib/constants/provinces";
import { CellDisplay } from "@/components/admin/report-builder/CellDisplay";

function escapeCsv(val: string): string {
  if (val.includes('"') || val.includes(",") || val.includes("\n") || val.includes("\r")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

function downloadCsv(
  rows: Record<string, unknown>[],
  fields: { key: string; label: string }[],
  isGrouped: boolean,
) {
  const headers: string[] = [];
  if (isGrouped) {
    headers.push("Group");
    headers.push("Count");
  } else {
    for (const f of fields) {
      headers.push(f.label);
    }
  }

  const csvLines: string[] = [headers.map(escapeCsv).join(",")];

  for (const row of rows) {
    const cells: string[] = [];
    if (isGrouped) {
      cells.push(escapeCsv(String(row._groupKey ?? "")));
      cells.push(escapeCsv(String(row.count ?? "")));
    } else {
      for (const f of fields) {
        const val = row[f.key];
        if (Array.isArray(val)) {
          cells.push(escapeCsv(val.join("; ")));
        } else if (val === null || val === undefined) {
          cells.push("");
        } else {
          cells.push(escapeCsv(String(val)));
        }
      }
    }
    csvLines.push(cells.join(","));
  }

  const csv = "\uFEFF" + csvLines.join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `report-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}


const AVAILABLE_FIELDS = [
  { key: "firstName", label: "First Name", group: "Personal" },
  { key: "surname", label: "Surname", group: "Personal" },
  { key: "phone", label: "Phone", group: "Personal" },
  { key: "email", label: "Email", group: "Personal" },
  { key: "province", label: "Province", group: "Location" },
  { key: "city", label: "City", group: "Location" },
  { key: "suburb", label: "Suburb", group: "Location" },
  { key: "gender", label: "Gender", group: "Demographics" },
  { key: "ageGroup", label: "Age Group", group: "Demographics" },
  { key: "educationLevel", label: "Education", group: "Demographics" },
  { key: "yearsExperience", label: "Experience", group: "Demographics" },
  { key: "mainWorkFocus", label: "Work Focus", group: "Demographics" },
  { key: "hasCertification", label: "Certification", group: "Skills" },
  { key: "hasFormalTraining", label: "Formal Training", group: "Skills" },
  { key: "confidenceTraditionalRefrigerants", label: "Trad. Confidence", group: "Skills" },
  { key: "confidenceLowGwpRefrigerants", label: "Low-GWP Confidence", group: "Skills" },
  { key: "status", label: "Status", group: "Submission" },
  { key: "submittedAt", label: "Submitted", group: "Submission" },
  { key: "submissionSource", label: "Source", group: "Submission" },
  { key: "consentToContact", label: "Consent Contact", group: "Consent" },
  { key: "consentToPublicRegistry", label: "Consent Registry", group: "Consent" },
  { key: "installsEnergyEfficient", label: "Energy Efficient", group: "Skills" },
];

// Group fields for display
const FIELD_GROUPS = [
  { group: "Personal", label: "Personal Info" },
  { group: "Location", label: "Location" },
  { group: "Demographics", label: "Demographics" },
  { group: "Skills", label: "Skills & Training" },
  { group: "Submission", label: "Submission" },
  { group: "Consent", label: "Consent" },
] as const;

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
  const [isGrouped, setIsGrouped] = useState(false);
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
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to fetch report");
      }
      const data = await res.json();
      setResults((data.results as Record<string, unknown>[]) ?? []);
      setIsGrouped(data.grouped === true);
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
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Fields</h2>
              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                {selectedFields.length} of {AVAILABLE_FIELDS.length}
              </span>
            </div>
            <div className="space-y-3">
              {FIELD_GROUPS.map((g) => {
                const groupFields = AVAILABLE_FIELDS.filter((f) => f.group === g.group);
                if (groupFields.length === 0) return null;
                return (
                  <div key={g.group}>
                    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{g.label}</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {groupFields.map((f) => (
                        <label
                          key={f.key}
                          className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-colors ${
                            selectedFields.includes(f.key)
                              ? "border-brand-600 bg-brand-50 text-slate-900"
                              : "border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedFields.includes(f.key)}
                            onChange={() => toggleField(f.key)}
                            className="accent-brand-600 size-3"
                          />
                          {f.label}
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
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
            {groupBy !== "none" && (
              <p className="mt-2 text-xs text-slate-500">
                Results will show counts per {GROUP_BY_OPTIONS.find((o) => o.key === groupBy)?.label ?? groupBy}
              </p>
            )}
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
            {loading ? "Running…" : "Run Report"}
          </Button>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Results panel */}
        <div className="lg:col-span-2">
          {results === null ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 text-sm text-slate-400">
              <svg className="mb-3 h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
              </svg>
              <p className="font-medium text-slate-500">Ready to build your report</p>
              <p className="mt-1 text-xs text-slate-400">Select fields on the left, then click <strong>Run Report</strong></p>
            </div>
          ) : results.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 text-sm text-slate-400">
              <svg className="mb-3 h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6 4.125 2.25 2.25m0 0 2.25 2.25M12 11.625l2.25-2.25M12 11.625l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
              </svg>
              <p className="font-medium text-slate-500">No results match your criteria</p>
              <p className="mt-1 text-xs text-slate-400">Try adjusting your filters or selecting different fields</p>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <span className="text-xs font-medium text-slate-500">
                  {results.length} row{results.length !== 1 ? "s" : ""}
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"                    onClick={() =>
                    downloadCsv(
                      results,
                      selectedFields.map((k) => ({
                        key: k,
                        label:
                          AVAILABLE_FIELDS.find((f) => f.key === k)?.label ?? k,
                      })),
                      isGrouped,
                    )
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 10v6m0 0-3-3m3 3 3-3m2 8H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"
                    />
                  </svg>
                  Download CSV
                </Button>
              </div>
              <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    {groupBy !== "none" && (
                      <th className="px-4 py-3">
                        {GROUP_BY_OPTIONS.find((o) => o.key === groupBy)
                          ?.label ?? groupBy}
                      </th>
                    )}
                    {isGrouped ? (
                      <th className="px-4 py-3">Count</th>
                    ) : (
                      selectedFields.map((f) => (
                        <th key={f} className="px-4 py-3">
                          {AVAILABLE_FIELDS.find((af) => af.key === f)
                            ?.label ?? f}
                        </th>
                      ))
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      {groupBy !== "none" && (
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {PROVINCE_LABELS[row._groupKey as keyof typeof PROVINCE_LABELS] ?? String(row._groupKey ?? "—")}
                        </td>
                      )}
                      {isGrouped ? (
                        <td className="px-4 py-3 font-semibold text-slate-900 tabular-nums">
                          {String(row.count ?? "—")}
                        </td>
                      ) : (
                        selectedFields.map((f) => (
                          <td key={f} className="px-4 py-3 text-slate-700">
                            <CellDisplay fieldKey={f} value={row[f]} />
                          </td>
                        ))
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
