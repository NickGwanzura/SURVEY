type ProgressBarProps = {
  step: number;
  totalSteps: number;
  title: string;
  stepTitles: string[];
};

export function ProgressBar({ step, totalSteps, title, stepTitles }: ProgressBarProps) {
  const percent = Math.round((step / totalSteps) * 100);
  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sticky top-3 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/95">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white tabular-nums">
            {step}
          </span>
          <span className="text-xs font-medium text-slate-500">
            of {totalSteps} sections
          </span>
        </span>
        <span className="text-xs font-semibold tabular-nums text-brand-600">
          {percent}%
        </span>
      </div>
      <h2 className="text-xl font-semibold leading-snug tracking-tight text-slate-900">{title}</h2>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Survey progress: ${percent}%`}
      >
        <div
          className="h-full rounded-full bg-brand-600 transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Step labels below progress bar */}
      <div className="hidden sm:flex gap-0" aria-hidden>
        {stepTitles.map((stepTitle, i) => {
          const stepNum = i + 1;
          const isCompleted = stepNum < step;
          const isCurrent = stepNum === step;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`h-1.5 w-full rounded-full transition-colors duration-300 ${
                  stepNum <= step ? "bg-brand-600" : "bg-slate-200"
                }`}
              />
              <span
                className={`text-[10px] leading-tight text-center transition-colors duration-300 max-w-[80px] truncate ${
                  isCurrent
                    ? "font-semibold text-brand-700"
                    : isCompleted
                      ? "font-medium text-brand-500"
                      : "text-slate-400"
                }`}
              >
                {stepTitle}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
