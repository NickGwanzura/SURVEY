"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";

type AnalysisResult = {
  overview: string;
  keyFindings: string[];
  recommendations: string[];
};

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M7 1.5l1.5 4.5 4.5 1-4.5 1.5L7 12.5l-1.5-4.5L1 7l4.5-1L7 1.5z"
        fill="currentColor"
        opacity="0.6"
      />
    </svg>
  );
}

type Props = {
  reportType: string;
  reportLabel: string;
  data: Record<string, Array<{ label: string; count: number }>>;
  sampleSize: number;
};

export function AiReportPanel({ reportType, reportLabel, data, sampleSize }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runAnalysis() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/admin/ai-analyze/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportType, reportLabel, data, sampleSize }),
      });

      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(json?.error ?? "Analysis failed.");
      }

      const analysis = (await res.json()) as AnalysisResult;
      setResult(analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <SparkleIcon className="h-3.5 w-3.5 text-amber-500" />
            AI Report Analysis
          </p>
          {!result && !error && (
            <p className="mt-1 text-sm text-slate-500">
              Generate an AI-powered summary of this report&apos;s data with key findings and
              recommendations.
            </p>
          )}
        </div>
        <Button
          variant="secondary"
          size="sm"
          loading={loading}
          onClick={runAnalysis}
          disabled={loading}
        >
          <SparkleIcon className="mr-1.5 h-3.5 w-3.5" />
          {result ? "Re-analyse" : "Analyse with AI"}
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="flex flex-col gap-4">
          {/* Overview */}
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Overview
            </p>
            <p className="text-sm leading-relaxed text-slate-700">{result.overview}</p>
          </div>

          {/* Key Findings */}
          {result.keyFindings.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Key Findings
              </p>
              <ul className="flex flex-col gap-1.5">
                {result.keyFindings.map((finding, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-700">
                      {i + 1}
                    </span>
                    {finding}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Recommendations
              </p>
              <ul className="flex flex-col gap-1.5">
                {result.recommendations.map((rec, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 rounded-lg border border-emerald-100 bg-emerald-50/60 px-3 py-2 text-sm text-emerald-800"
                  >
                    <svg
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600"
                      viewBox="0 0 14 14"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M3 7l3 3 5-5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
