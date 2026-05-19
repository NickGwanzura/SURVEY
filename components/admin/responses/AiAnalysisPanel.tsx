"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/admin/Badge";

type AnalysisResult = {
  summary: string;
  flags: string[];
  recommendation: string;
};

function formatLabel(label: string): string {
  return label
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function AiAnalysisPanel({ surveyId }: { surveyId: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runAnalysis() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/admin/ai-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ surveyId }),
      });

      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(json?.error ?? "Analysis failed.");
      }

      const data = (await res.json()) as AnalysisResult;
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  const recBadge: {
    [key: string]: "success" | "danger" | "neutral";
  } = {
    approve: "success",
    "request more info": "neutral",
    "flag for manual review": "danger",
    "manual review": "danger",
  };

  return (
    <aside
      aria-label="AI analysis"
      className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div>
        <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path
              d="M7 1.5l1.5 4.5 4.5 1-4.5 1.5L7 12.5l-1.5-4.5L1 7l4.5-1L7 1.5z"
              fill="currentColor"
              opacity="0.6"
            />
          </svg>
          AI Analysis
        </p>

        {!result && !error && !loading && (
          <p className="text-sm text-slate-500">
            Use AI to analyse this submission for potential flags and recommendations.
          </p>
        )}

        {error && (
          <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        {result && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Recommendation:</span>
              <Badge tone={recBadge[result.recommendation] ?? "neutral"}>
                {formatLabel(result.recommendation)}
              </Badge>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-slate-500">Summary</p>
              <p className="text-sm leading-relaxed text-slate-700">{result.summary}</p>
            </div>

            {result.flags.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-medium text-slate-500">
                  Flags ({result.flags.length})
                </p>
                <ul className="flex flex-col gap-1">
                  {result.flags.map((flag, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-1.5 rounded-lg border border-amber-100 bg-amber-50 px-2.5 py-1.5 text-xs text-amber-800"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        aria-hidden
                        className="mt-0.5 shrink-0 text-amber-600"
                      >
                        <path
                          d="M2.5 1.5v9M2.5 1.5l6 2-6 2.5"
                          stroke="currentColor"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.flags.length === 0 && (
              <div className="flex items-center gap-1.5 rounded-lg border border-green-100 bg-green-50 px-3 py-2 text-xs text-green-700">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <path
                    d="M3 6l2 2 4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                No flags detected
              </div>
            )}
          </div>
        )}
      </div>

      <Button
        variant="secondary"
        size="sm"
        loading={loading}
        onClick={runAnalysis}
        disabled={loading}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden
          className="mr-1.5"
        >
          <path
            d="M7 1.5l1.5 4.5 4.5 1-4.5 1.5L7 12.5l-1.5-4.5L1 7l4.5-1L7 1.5z"
            fill="currentColor"
            opacity="0.6"
          />
        </svg>
        {result ? "Re-analyse" : "Analyse with AI"}
      </Button>
    </aside>
  );
}
