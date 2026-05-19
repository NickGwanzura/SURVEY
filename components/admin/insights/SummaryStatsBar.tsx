import type { InsightsData } from "@/lib/admin/insights-data";

type StatCardProps = {
  label: string;
  value: string;
  sublabel?: string;
  highlight?: "positive" | "warning" | "neutral";
  icon?: React.ReactNode;
};

function StatCard({ label, value, sublabel, highlight = "neutral", icon }: StatCardProps) {
  const borderColor =
    highlight === "positive"
      ? "border-emerald-200"
      : highlight === "warning"
        ? "border-amber-200"
        : "border-slate-200";

  const bgColor =
    highlight === "positive"
      ? "bg-emerald-50/60"
      : highlight === "warning"
        ? "bg-amber-50/60"
        : "bg-white";

  const valueColor =
    highlight === "positive"
      ? "text-emerald-700"
      : highlight === "warning"
        ? "text-amber-700"
        : "text-slate-900";

  return (
    <div
      className={`flex flex-col gap-1 rounded-xl border ${borderColor} ${bgColor} p-3.5 shadow-sm`}
    >
      <div className="flex items-center gap-2">
        {icon && <span className="shrink-0 text-slate-400">{icon}</span>}
        <span className={`text-2xl font-semibold tabular-nums leading-none ${valueColor}`}>
          {value}
        </span>
      </div>
      <span className="text-xs leading-tight text-slate-500">{label}</span>
      {sublabel && (
        <span className="text-[10px] leading-tight text-slate-400">{sublabel}</span>
      )}
    </div>
  );
}

function CertificationIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M9 12l2 2 4-4" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function BrainIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M12 2a4 4 0 014 4c0 2-1.5 3-2 4h-4c-.5-1-2-2-2-4a4 4 0 014-4z" />
      <path d="M8 14v2a2 2 0 002 2h4a2 2 0 002-2v-2" />
      <path d="M6 10h.01M18 10h.01" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function ZapIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

function WrenchIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function TrendIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function findPercentByValue(
  data: Array<{ value: string; label: string; count: number; percent: number }>,
  value: string,
): number | null {
  const item = data.find((d) => d.value === value);
  return item ? item.percent : null;
}

export function SummaryStatsBar({ insights }: { insights: InsightsData }) {
  const {
    skills,
    resources,
    challenges,
    energy,
  } = insights;

  // Compute overall certification rate (average across provinces)
  const certRate =
    skills.certificationRateByProvince.length > 0
      ? skills.certificationRateByProvince.reduce((s, p) => s + p.certifiedPercent, 0) /
        skills.certificationRateByProvince.length
      : 0;

  // Compute overall PPE access rate
  const ppeFull = findPercentByValue(challenges.ppeAccessDistribution, "full_provided");

  // Recovery equipment always-use rate
  const recoveryAlways = findPercentByValue(challenges.recoveryEquipmentUseRate, "always");

  // Energy-efficient always-install rate
  const energyAlways = findPercentByValue(energy.energyEfficientInstallRate, "always");

  // Average access score (1-5 scale)
  const avgAccess =
    (resources.accessMeans.tools +
      resources.accessMeans.spareParts +
      resources.accessMeans.lowGwpRefrigerants) / 3;

  // Training gap
  const gap = skills.avgConfidenceTraditional - skills.avgConfidenceLowGwp;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
      <StatCard
        label="Certification Rate"
        value={`${certRate.toFixed(1)}%`}
        sublabel="Across all provinces"
        highlight={certRate >= 50 ? "positive" : "warning"}
        icon={<CertificationIcon />}
      />

      <StatCard
        label="Confidence (Traditional)"
        value={`${skills.avgConfidenceTraditional.toFixed(1)}`}
        sublabel="out of 5"
        highlight={skills.avgConfidenceTraditional >= 3.5 ? "positive" : "warning"}
        icon={<BrainIcon />}
      />

      <StatCard
        label="Confidence (Low-GWP)"
        value={`${skills.avgConfidenceLowGwp.toFixed(1)}`}
        sublabel="out of 5"
        highlight={skills.avgConfidenceLowGwp >= 3.5 ? "positive" : "warning"}
        icon={<BrainIcon />}
      />

      <StatCard
        label="Training Gap"
        value={gap > 0 ? `+${gap.toFixed(2)}` : gap.toFixed(2)}
        sublabel="Trad − Low-GWP"
        highlight={gap > 0.5 ? "warning" : gap > 0 ? "neutral" : "positive"}
        icon={<TrendIcon />}
      />

      <StatCard
        label="PPE (Full Access)"
        value={ppeFull !== null ? `${ppeFull.toFixed(1)}%` : "—"}
        sublabel="of technicians"
        highlight={ppeFull !== null && ppeFull >= 50 ? "positive" : "warning"}
        icon={<ShieldIcon />}
      />

      <StatCard
        label="Recovery Eq. (Always)"
        value={recoveryAlways !== null ? `${recoveryAlways.toFixed(1)}%` : "—"}
        sublabel="of technicians"
        highlight={recoveryAlways !== null && recoveryAlways >= 50 ? "positive" : "warning"}
        icon={<WrenchIcon />}
      />

      <StatCard
        label="Energy-Efficient (Always)"
        value={energyAlways !== null ? `${energyAlways.toFixed(1)}%` : "—"}
        sublabel="of technicians"
        highlight={energyAlways !== null && energyAlways >= 50 ? "positive" : "warning"}
        icon={<ZapIcon />}
      />

      <StatCard
        label="Avg Access Score"
        value={avgAccess.toFixed(2)}
        sublabel="Tools, parts &amp; refrigerants (1–5)"
        highlight={avgAccess >= 3 ? "positive" : "warning"}
        icon={<WrenchIcon />}
      />
    </div>
  );
}
