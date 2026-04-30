type ProgressBarProps = {
  step: number; // 1-based
  totalSteps: number;
  title: string;
};

export function ProgressBar({ step, totalSteps, title }: ProgressBarProps) {
  const percent = Math.round((step / totalSteps) * 100);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm text-slate-600">
        <span className="font-medium">
          Section {step} of {totalSteps}
        </span>
        <span className="tabular-nums">{percent}%</span>
      </div>
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-brand-600 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
