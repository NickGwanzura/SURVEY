"use client";

import { PROVINCES, PROVINCE_LABELS } from "@/lib/constants/provinces";
import { MAIN_WORK_FOCUS, MAIN_WORK_FOCUS_LABELS } from "@/lib/constants/workFocus";
import { HAS_CERTIFICATION_OPTIONS, HAS_CERTIFICATION_LABELS } from "@/lib/constants/refrigerants";
import { YEARS_EXPERIENCE, YEARS_EXPERIENCE_LABELS } from "@/lib/constants/ageGroups";
import { SUBMISSION_STATUSES } from "@/lib/constants/challenges";

export type MapFilterState = {
  province: string;
  mainWorkFocus: string;
  hasCertification: string;
  yearsExperience: string;
  status: string;
};

type MapFiltersProps = {
  value: MapFilterState;
  onChange: (next: MapFilterState) => void;
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  verified: "Verified",
  flagged: "Flagged",
  duplicate: "Duplicate",
};

export function MapFilters({ value, onChange }: MapFiltersProps) {
  function set(key: keyof MapFilterState, val: string) {
    onChange({ ...value, [key]: val });
  }

  function reset() {
    onChange({ province: "", mainWorkFocus: "", hasCertification: "", yearsExperience: "", status: "" });
  }

  const hasActive = Object.values(value).some(Boolean);

  return (
    <div className="flex flex-col gap-3 px-3 py-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Filters</p>
        {hasActive && (
          <button
            type="button"
            onClick={reset}
            className="text-xs text-brand-600 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Province */}
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-700">Province</label>
        <select
          value={value.province}
          onChange={(e) => set("province", e.target.value)}
          className="block w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:outline-2 focus:outline-brand-600"
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
          value={value.mainWorkFocus}
          onChange={(e) => set("mainWorkFocus", e.target.value)}
          className="block w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:outline-2 focus:outline-brand-600"
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
          value={value.hasCertification}
          onChange={(e) => set("hasCertification", e.target.value)}
          className="block w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:outline-2 focus:outline-brand-600"
        >
          <option value="">Any</option>
          {HAS_CERTIFICATION_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {HAS_CERTIFICATION_LABELS[c]}
            </option>
          ))}
        </select>
      </div>

      {/* Years experience */}
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-700">Years experience</label>
        <select
          value={value.yearsExperience}
          onChange={(e) => set("yearsExperience", e.target.value)}
          className="block w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:outline-2 focus:outline-brand-600"
        >
          <option value="">Any</option>
          {YEARS_EXPERIENCE.map((y) => (
            <option key={y} value={y}>
              {YEARS_EXPERIENCE_LABELS[y]}
            </option>
          ))}
        </select>
      </div>

      {/* Status */}
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-700">Status</label>
        <select
          value={value.status}
          onChange={(e) => set("status", e.target.value)}
          className="block w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:outline-2 focus:outline-brand-600"
        >
          <option value="">All</option>
          {SUBMISSION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s] ?? s}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
