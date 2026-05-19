"use client";

import { useState, useEffect } from "react";

import { Button } from "@/components/ui/Button";
import { SectionCard } from "@/components/admin/insights/SectionCard";

type InsightResult = {
  overview: string;
  keyFindings: string[];
  recommendations: string[];
  generatedAt: string;
  sampleSize: number;
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

export function AiInsightPanel() {
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [result, setResult] = useState<InsightResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadAnalysis() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/ai-analyze", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(json?.error ?? "Analysis failed.");
      }

      const data = (await res.json()) as InsightResult;
      setResult(data);
      setLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SectionCard title="AI Executive Summary">
      <div className="flex flex-col gap-4">
        {!loaded && !error && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600" />
                Generating AI summary…
              </>
            ) : (
              <span>Click to generate an AI-powered executive summary.</span>
            )}
          </div>
        )}

        {error && (
          <div className="flex flex-col gap-3">
            <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
            <div>
              <Button variant="secondary" size="sm" loading={loading} onClick={loadAnalysis}>
                Retry
              </Button>
            </div>
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
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <SparkleIcon className="h-3.5 w-3.5 text-amber-500" />
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

            {/* Recommendations */}
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <svg className="h-3.5 w-3.5 text-emerald-500" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path
                    d="M7 1.5l1.5 4.5 4.5 1-4.5 1.5L7 12.5l-1.5-4.5L1 7l4.5-1L7 1.5z"
                    fill="currentColor"
                    opacity="0.6"
                  />
                </svg>
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

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <p className="text-[11px] text-slate-400">
                Based on <strong className="font-semibold text-slate-500">{result.sampleSize.toLocaleString()}</strong> submissions
              </p>
              <Button
                variant="secondary"
                size="sm"
                loading={loading}
                onClick={loadAnalysis}
              >
                Refresh
              </Button>
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
