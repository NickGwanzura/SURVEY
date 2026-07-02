import { cn } from "@/lib/cn";

type SkeletonProps = {
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...rest }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-slate-200",
        className,
      )}
      aria-hidden="true"
      {...rest}
    />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white p-5 shadow-sm", className)}>
      <Skeleton className="mb-3 h-3 w-24" />
      <Skeleton className="h-7 w-32" />
      <Skeleton className="mt-2 h-3 w-20" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-sm" aria-hidden>
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-4 py-3">
                <Skeleton className="h-3 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c} className="px-4 py-3">
                  <Skeleton className={cn("h-4", c === 0 ? "w-28" : c === 1 ? "w-24" : "w-16")} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SkeletonChart({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-slate-200 bg-white p-5 shadow-sm", className)}>
      <Skeleton className="mb-4 h-4 w-40" />
      <div className="flex items-end gap-2" style={{ height: 160 }}>
        {[70, 45, 85, 30, 60, 50, 75, 40, 65, 55, 80, 35].map((h, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-b-lg"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonDetail({ rows = 6 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <Skeleton className="mb-4 h-5 w-40" />
      <div className="flex flex-col gap-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1 sm:flex-row sm:gap-4">
            <Skeleton className="h-4 w-48 sm:w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}
