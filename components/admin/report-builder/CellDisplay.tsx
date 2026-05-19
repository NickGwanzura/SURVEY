"use client";

import { StatusBadge } from "@/components/admin/Badge";
import { formatCellDate } from "@/lib/report-builder-utils";

/** Boolean / yes‑no field keys that get friendly Yes/No rendering. */
const BOOLEAN_FIELD_KEYS = [
  "hasCertification",
  "hasFormalTraining",
  "consentToContact",
  "consentToPublicRegistry",
  "installsEnergyEfficient",
] as const;

export type CellDisplayProps = {
  fieldKey: string;
  value: unknown;
};

/** Render a cell value appropriately based on field key. */
export function CellDisplay({ fieldKey, value }: CellDisplayProps) {
  // Status field → use StatusBadge
  if (fieldKey === "status" && typeof value === "string") {
    return <StatusBadge status={value as "pending" | "verified" | "flagged" | "duplicate"} />;
  }

  // Boolean / yes-no fields → friendly label
  if ((BOOLEAN_FIELD_KEYS as readonly string[]).includes(fieldKey)) {
    if (value === null || value === undefined) return <span className="text-slate-400">—</span>;
    const s = String(value);
    if (s === "yes") return <span className="font-medium text-emerald-700">Yes</span>;
    if (s === "no") return <span className="text-slate-500">No</span>;
    return <span>{s}</span>;
  }

  // Date fields → formatted date
  if (fieldKey === "submittedAt") {
    return <span className="text-slate-600 tabular-nums">{formatCellDate(value)}</span>;
  }

  // Null/undefined
  if (value === null || value === undefined) return <span className="text-slate-400">—</span>;

  // Arrays → joined string
  if (Array.isArray(value)) {
    return <span>{(value as unknown[]).join(", ")}</span>;
  }

  return <span>{String(value)}</span>;
}
