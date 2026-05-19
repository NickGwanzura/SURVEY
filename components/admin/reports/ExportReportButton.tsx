"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

type ExportReportButtonProps = {
  report: string;
  filename: string;
};

export function ExportReportButton({ report, filename }: ExportReportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports/export?report=${report}`, {
        method: "GET",
      });
      if (!res.ok) throw new Error("Export failed");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      console.error(err);
      alert("Failed to export report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="secondary" size="sm" onClick={handleExport} loading={loading}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="mr-1.5">
        <path d="M9 2v9M6 8l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 12v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      Export CSV
    </Button>
  );
}
