import { cn } from "@/lib/cn";

type LikertDotsProps = {
  value: number; // 1..5
  label?: string;
  className?: string;
};

export function LikertDots({ value, label, className }: LikertDotsProps) {
  const safe = Math.max(1, Math.min(5, value));
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex gap-1" aria-label={`${safe} of 5`}>
        {[1, 2, 3, 4, 5].map((v) => (
          <span
            key={v}
            className={cn(
              "h-3 w-3 rounded-full",
              v <= safe ? "bg-brand-600" : "bg-slate-200",
            )}
          />
        ))}
      </div>
      <span className="text-sm tabular-nums text-slate-700">
        {safe}/5
        {label ? <span className="ml-1 text-slate-500">· {label}</span> : null}
      </span>
    </div>
  );
}
