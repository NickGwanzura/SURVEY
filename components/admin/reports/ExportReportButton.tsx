"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type ExportReportButtonProps = {
  report: string;
  filename: string;
};

export function ExportReportButton({ report, filename }: ExportReportButtonProps) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExport = async (format: "csv" | "pdf") => {
    setLoading(true);
    setOpen(false);
    try {
      const res = await fetch(`/api/admin/reports/export?report=${report}&format=${format}`, {
        method: "GET",
      });
      if (!res.ok) throw new Error("Export failed");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.${format}`;
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
    <div className="relative" ref={menuRef}>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setOpen(!open)}
        loading={loading}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="mr-1.5">
          <path d="M9 2v9M6 8l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 12v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        Export
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden
          className={cn("ml-1 transition-transform", open && "rotate-180")}
        >
          <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Button>

      {open && (
        <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          <button
            type="button"
            onClick={() => handleExport("csv")}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <rect x="2" y="2" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M5 6h6M5 8h6M5 10h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <span className="flex flex-col items-start">
              <span className="font-medium">CSV</span>
              <span className="text-xs text-slate-400">Spreadsheet data</span>
            </span>
          </button>
          <div className="border-t border-slate-100" />
          <button
            type="button"
            onClick={() => handleExport("pdf")}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <rect x="2" y="1" width="12" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M5 5h6M5 7h6M5 9h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M11 11v2.5a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5V11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <span className="flex flex-col items-start">
              <span className="font-medium">PDF</span>
              <span className="text-xs text-slate-400">Branded report</span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
