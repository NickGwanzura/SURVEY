"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

type ReportRecord = {
  id: string;
  reportTitle: string;
  surveyName: string;
  reportingPeriodStart: string;
  reportingPeriodEnd: string;
  totalResponses: number;
  generatedBy: string;
  generatedAt: string;
  status: string;
  pdfUrl: string | null;
  aiSummary: {
    overview: string;
    keyFindings: string[];
    riskAreas: string[];
    opportunities: string[];
    recommendedInterventions: string[];
    priorityActions: string[];
  } | null;
  createdAt: string;
  generatorName: string;
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function TechnicianSurveyReportPage() {
  const toast = useToast();
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [surveyName, setSurveyName] = useState("RAC Technician Survey");

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reports/technician-survey");
      if (!res.ok) throw new Error("Failed to fetch reports");
      const json = (await res.json()) as { reports: ReportRecord[] };
      setReports(json.reports);
    } catch (err) {
      toast.push({
        variant: "error",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load reports",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/reports/technician-survey/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          surveyName,
        }),
      });

      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(json?.error ?? `HTTP ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Technician_Survey_Report.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.push({
        variant: "success",
        title: "Report Generated",
        description: "The technician survey report has been generated and downloaded.",
      });

      await fetchReports();
    } catch (err) {
      toast.push({
        variant: "error",
        title: "Generation Failed",
        description: err instanceof Error ? err.message : "Failed to generate report",
      });
    } finally {
      setGenerating(false);
    }
  }

  async function handleDownload(reportId: string) {
    try {
      const res = await fetch(`/api/admin/reports/technician-survey/${reportId}/download`);
      if (!res.ok) throw new Error("Failed to download report");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Technician_Survey_Report.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.push({
        variant: "error",
        title: "Download Failed",
        description: err instanceof Error ? err.message : "Failed to download report",
      });
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
            Reports
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            Technician Survey Report
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Generate a comprehensive PDF report from technician survey data — includes
            demographics, skills, training needs, tools access, challenges, and sector
            insights.
          </p>
        </div>
      </div>

      {/* Generate Panel */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">
          Generate New Report
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Survey Name
            </label>
            <input
              type="text"
              value={surveyName}
              onChange={(e) => setSurveyName(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>
        <div className="mt-4">
          <Button
            variant="primary"
            size="md"
            loading={generating}
            disabled={generating}
            onClick={handleGenerate}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Generate Technician Survey Report
          </Button>
          <p className="mt-2 text-xs text-slate-400">
            Leave date fields empty to include all available data.
          </p>
        </div>
      </section>

      {/* Report History */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Report History
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Previously generated technician survey reports
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              loading={loading}
              onClick={fetchReports}
              disabled={loading}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M2 8a6 6 0 0 1 11.4-3M14 8a6 6 0 0 1-11.4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M12 2v3.5H15.5M4 14v-3.5H0.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Refresh
            </Button>
          </div>
        </div>

        {reports.length === 0 && !loading && (
          <div className="px-5 py-12 text-center">
            <svg
              className="mx-auto mb-3 h-10 w-10 text-slate-300"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <path
                d="M9 12h6M12 9v6M3 7.5L12 2l9 5.5v9L12 22l-9-5.5v-9z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-sm text-slate-500">No reports generated yet.</p>
            <p className="mt-1 text-xs text-slate-400">
              Use the panel above to generate your first technician survey report.
            </p>
          </div>
        )}

        {loading && reports.length === 0 && (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
            <p className="mt-2 text-sm text-slate-500">Loading reports...</p>
          </div>
        )}

        {reports.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium">Title</th>
                  <th className="px-4 py-2.5 text-left font-medium">Survey</th>
                  <th className="px-4 py-2.5 text-left font-medium">Period</th>
                  <th className="px-4 py-2.5 text-right font-medium">Responses</th>
                  <th className="px-4 py-2.5 text-left font-medium">Generated By</th>
                  <th className="px-4 py-2.5 text-left font-medium">Date</th>
                  <th className="px-4 py-2.5 text-center font-medium">Status</th>
                  <th className="px-4 py-2.5 text-center font-medium">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50">
                    <td className="max-w-[180px] truncate px-4 py-2.5 font-medium text-slate-900">
                      {report.reportTitle}
                    </td>
                    <td className="max-w-[120px] truncate px-4 py-2.5 text-slate-600">
                      {report.surveyName}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">
                      <span className="text-xs">
                        {formatDateShort(report.reportingPeriodStart)} — {formatDateShort(report.reportingPeriodEnd)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-slate-700">
                      {report.totalResponses.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">
                      {report.generatorName}
                    </td>
                    <td className="px-4 py-2.5 text-slate-500">
                      <span className="text-xs">
                        {formatDate(report.generatedAt)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        {report.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleDownload(report.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-brand-600"
                      >
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
                          <path d="M8 2v9M5 8l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M2 12v2h12v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
