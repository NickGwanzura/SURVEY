import React from "react";

type ReportTableProps = {
  title: string;
  data: { label: string | boolean; count: number }[];
};

export function ReportTable({ title, data }: ReportTableProps) {
  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-5 py-2.5 text-left font-medium">Category</th>
              <th className="px-5 py-2.5 text-right font-medium">Count</th>
              <th className="px-5 py-2.5 text-right font-medium">%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-slate-500">
                  No data available.
                </td>
              </tr>
            ) : (
              data.map((row, idx) => {
                const percent = total > 0 ? ((row.count / total) * 100).toFixed(1) : "0.0";
                return (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-5 py-3 text-slate-700 capitalize">
                      {String(row.label).replace(/_/g, " ")}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-slate-900 font-medium">
                      {row.count}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-slate-500">
                      {percent}%
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
