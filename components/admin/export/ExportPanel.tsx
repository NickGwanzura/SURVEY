"use client";

import { useState } from "react";

import { PROVINCES, PROVINCE_LABELS } from "@/lib/constants/provinces";
import { MAIN_WORK_FOCUS, MAIN_WORK_FOCUS_LABELS } from "@/lib/constants/workFocus";
import { HAS_CERTIFICATION_OPTIONS, HAS_CERTIFICATION_LABELS } from "@/lib/constants/refrigerants";
import { YEARS_EXPERIENCE, YEARS_EXPERIENCE_LABELS } from "@/lib/constants/ageGroups";
import { EDUCATION_LEVELS, EDUCATION_LEVEL_LABELS } from "@/lib/constants/educationLevels";
import { SUBMISSION_STATUSES } from "@/lib/constants/challenges";
import { Button } from "@/components/ui/Button";

type ExportFormat = "csv" | "excel" | "pdf" | "geojson" | "spss";

type Filters = {
  province: string;
  mainWorkFocus: string;
  hasCertification: string;
  status: string;
  yearsExperience: string;
  educationLevel: string;
  dateFrom: string;
  dateTo: string;
  q: string;
};

type Sections = {
  background: boolean;
  skills: boolean;
  tools: boolean;
  challenges: boolean;
  energy: boolean;
  consent: boolean;
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  verified: "Verified",
  flagged: "Flagged",
  duplicate: "Duplicate",
};

const FORMAT_LABELS: Record<ExportFormat, { label: string; description: string }> = {
  csv: { label: "CSV", description: "UTF-8 with BOM, Excel-compatible" },
  excel: { label: "Excel (.xlsx)", description: "SheetJS workbook" },
  pdf: { label: "PDF", description: "A4 landscape, branded" },
  geojson: { label: "GeoJSON", description: "GPS-only rows as FeatureCollection" },
  spss: { label: "SPSS-CSV", description: "Numeric codes, variable labels on row 2" },
};

const SECTION_LABELS: Record<keyof Sections, string> = {
  background: "Section 1 — Background",
  skills: "Section 2 — Skills & Training",
  tools: "Section 3 — Tools & Access",
  challenges: "Section 4 — Work Challenges",
  energy: "Section 5 — Energy Efficiency",
  consent: "Section 6 — Consent & Language",
};

export function ExportPanel() {
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [filters, setFilters] = useState<Filters>({
    province: "",
    mainWorkFocus: "",
    hasCertification: "",
    status: "",
    yearsExperience: "",
    educationLevel: "",
    dateFrom: "",
    dateTo: "",
    q: "",
  });
  const [sections, setSections] = useState<Sections>({
    background: true,
    skills: true,
    tools: true,
    challenges: true,
    energy: true,
    consent: true,
  });
  const [anonymise, setAnonymise] = useState(false);
  const [includePhotos, setIncludePhotos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);

  function setFilter(key: keyof Filters, val: string) {
    setFilters((prev) => ({ ...prev, [key]: val }));
  }

  function toggleSection(key: keyof Sections) {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const sectionControlsDisabled = format === "geojson" || format === "spss";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setBanner(null);

    try {
      const body = {
        format,
        filters: {
          province: filters.province || undefined,
          mainWorkFocus: filters.mainWorkFocus || undefined,
          hasCertification: filters.hasCertification || undefined,
          status: filters.status || undefined,
          yearsExperience: filters.yearsExperience || undefined,
          educationLevel: filters.educationLevel || undefined,
          dateFrom: filters.dateFrom || undefined,
          dateTo: filters.dateTo || undefined,
          q: filters.q || undefined,
        },
        sections,
        anonymise,
        includePhotos,
      };

      const res = await fetch("/api/admin/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Export failed" }));
        throw new Error((err as { error?: string }).error ?? "Export failed");
      }

      const contentDisposition = res.headers.get("Content-Disposition") ?? "";
      const match = contentDisposition.match(/filename="([^"]+)"/);
      const filename = match ? match[1] : `technicians-${Date.now()}`;

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setBanner({ type: "success", message: `Export downloaded: ${filename}` });
    } catch (err) {
      setBanner({
        type: "error",
        message: err instanceof Error ? err.message : "Export failed",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {banner && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            banner.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {banner.message}
        </div>
      )}

      {/* Format picker */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Export format</h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.entries(FORMAT_LABELS) as [ExportFormat, { label: string; description: string }][]).map(
            ([f, meta]) => (
              <label
                key={f}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                  format === f
                    ? "border-brand-600 bg-brand-50"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="format"
                  value={f}
                  checked={format === f}
                  onChange={() => setFormat(f)}
                  className="mt-0.5 accent-brand-600"
                />
                <div>
                  <p className="text-sm font-medium text-slate-900">{meta.label}</p>
                  <p className="text-xs text-slate-500">{meta.description}</p>
                </div>
              </label>
            ),
          )}
        </div>
      </section>

      {/* Filters */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Filters</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* Search */}
          <div className="lg:col-span-3">
            <label className="mb-1 block text-xs font-medium text-slate-700">Search</label>
            <input
              type="text"
              placeholder="Name or phone…"
              value={filters.q}
              onChange={(e) => setFilter("q", e.target.value)}
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-2 focus:outline-brand-600"
            />
          </div>

          {/* Province */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Province</label>
            <select
              value={filters.province}
              onChange={(e) => setFilter("province", e.target.value)}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-2 focus:outline-brand-600"
            >
              <option value="">All provinces</option>
              {PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {PROVINCE_LABELS[p]}
                </option>
              ))}
            </select>
          </div>

          {/* Work focus */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Work focus</label>
            <select
              value={filters.mainWorkFocus}
              onChange={(e) => setFilter("mainWorkFocus", e.target.value)}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-2 focus:outline-brand-600"
            >
              <option value="">All</option>
              {MAIN_WORK_FOCUS.map((f) => (
                <option key={f} value={f}>
                  {MAIN_WORK_FOCUS_LABELS[f]}
                </option>
              ))}
            </select>
          </div>

          {/* Certification */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Certification</label>
            <select
              value={filters.hasCertification}
              onChange={(e) => setFilter("hasCertification", e.target.value)}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-2 focus:outline-brand-600"
            >
              <option value="">Any</option>
              {HAS_CERTIFICATION_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {HAS_CERTIFICATION_LABELS[c]}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilter("status", e.target.value)}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-2 focus:outline-brand-600"
            >
              <option value="">All</option>
              {SUBMISSION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s] ?? s}
                </option>
              ))}
            </select>
          </div>

          {/* Years experience */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Years experience
            </label>
            <select
              value={filters.yearsExperience}
              onChange={(e) => setFilter("yearsExperience", e.target.value)}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-2 focus:outline-brand-600"
            >
              <option value="">Any</option>
              {YEARS_EXPERIENCE.map((y) => (
                <option key={y} value={y}>
                  {YEARS_EXPERIENCE_LABELS[y]}
                </option>
              ))}
            </select>
          </div>

          {/* Education level */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Education level
            </label>
            <select
              value={filters.educationLevel}
              onChange={(e) => setFilter("educationLevel", e.target.value)}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-2 focus:outline-brand-600"
            >
              <option value="">Any</option>
              {EDUCATION_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {EDUCATION_LEVEL_LABELS[l]}
                </option>
              ))}
            </select>
          </div>

          {/* Date range */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">From date</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilter("dateFrom", e.target.value)}
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-2 focus:outline-brand-600"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">To date</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilter("dateTo", e.target.value)}
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-2 focus:outline-brand-600"
            />
          </div>
        </div>
      </section>

      {/* Section toggles */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Include sections</h2>
            {sectionControlsDisabled && (
              <p className="mt-0.5 text-xs text-slate-500">
                Not applicable for {FORMAT_LABELS[format].label} — fixed schema
              </p>
            )}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.entries(SECTION_LABELS) as [keyof Sections, string][]).map(([key, label]) => (
            <label
              key={key}
              className={`flex cursor-pointer items-center gap-2.5 rounded-lg border p-3 text-sm transition-colors ${
                sectionControlsDisabled
                  ? "cursor-not-allowed opacity-50"
                  : sections[key]
                    ? "border-brand-600 bg-brand-50 text-slate-900"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              <input
                type="checkbox"
                checked={sections[key]}
                onChange={() => toggleSection(key)}
                disabled={sectionControlsDisabled}
                className="accent-brand-600"
              />
              {label}
            </label>
          ))}
        </div>
      </section>

      {/* Options */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Options</h2>
        <div className="flex flex-col gap-3">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={anonymise}
              onChange={(e) => setAnonymise(e.target.checked)}
              className="accent-brand-600"
            />
            <div>
              <p className="text-sm font-medium text-slate-900">Anonymise</p>
              <p className="text-xs text-slate-500">
                Omit name, phone, email. Replace ID with stable 8-char hash.
              </p>
            </div>
          </label>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={includePhotos}
              onChange={(e) => setIncludePhotos(e.target.checked)}
              className="accent-brand-600"
            />
            <div>
              <p className="text-sm font-medium text-slate-900">Include photo URLs</p>
              <p className="text-xs text-slate-500">
                Adds the profile photo URL column (Excel and CSV only).
              </p>
            </div>
          </label>
        </div>
      </section>

      {/* Submit */}
      <div className="flex justify-end">
        <Button type="submit" loading={loading} size="lg">
          Download {FORMAT_LABELS[format].label}
        </Button>
      </div>
    </form>
  );
}
