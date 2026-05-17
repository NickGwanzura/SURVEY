import { StatCard } from "@/components/admin/StatCard";

type Cards = {
  total: number;
  today: number;
  last7Days: number;
  verified: number;
  pending: number;
  flagged: number;
  duplicate: number;
};

function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <circle cx="9" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M1.5 16c0-3.038 3.358-5.5 7.5-5.5s7.5 2.462 7.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <rect x="2" y="3" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 7.5h14M6 2v2M12 2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function WeekIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M2 14l3-4 3 2 3-5 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 16h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5.5 9.5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 5v4.5l3 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M4 2v14M4 2l10 3-10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function StatsGrid({ cards }: { cards: Cards }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        label="Total Registrations"
        value={cards.total.toLocaleString()}
        hint="All time"
        icon={<UsersIcon />}
      />
      <StatCard
        label="Today"
        value={cards.today.toLocaleString()}
        hint="Submitted today (UTC)"
        tone={cards.today > 0 ? "success" : "default"}
        icon={<CalendarIcon />}
      />
      <StatCard
        label="Last 7 Days"
        value={cards.last7Days.toLocaleString()}
        hint="Rolling 7-day window"
        tone={cards.last7Days > 0 ? "success" : "default"}
        icon={<WeekIcon />}
      />
      <StatCard
        label="Verified"
        value={cards.verified.toLocaleString()}
        tone="success"
        icon={<CheckIcon />}
        hint={
          cards.total > 0
            ? `${((cards.verified / (cards.total - cards.duplicate)) * 100).toFixed(1)}% of reviewable`
            : undefined
        }
      />
      <StatCard
        label="Pending Review"
        value={cards.pending.toLocaleString()}
        tone={cards.pending > 0 ? "warning" : "default"}
        icon={<ClockIcon />}
      />
      <StatCard
        label="Flagged"
        value={cards.flagged.toLocaleString()}
        tone={cards.flagged > 0 ? "danger" : "default"}
        icon={<FlagIcon />}
      />
      <StatCard
        label="Duplicates"
        value={cards.duplicate.toLocaleString()}
        tone="default"
        icon={
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <rect x="3" y="3" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            <rect x="6" y="6" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        }
      />
    </div>
  );
}
