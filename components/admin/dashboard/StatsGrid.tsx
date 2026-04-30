import { StatCard } from "@/components/admin/StatCard";

type Cards = {
  total: number;
  today: number;
  thisWeek: number;
  verified: number;
  pending: number;
  flagged: number;
};

export function StatsGrid({ cards }: { cards: Cards }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        label="Total Registrations"
        value={cards.total.toLocaleString()}
        hint="All time"
      />
      <StatCard
        label="Today"
        value={cards.today.toLocaleString()}
        hint="Submitted today (UTC)"
        tone={cards.today > 0 ? "success" : "default"}
      />
      <StatCard
        label="This Week"
        value={cards.thisWeek.toLocaleString()}
        hint="Last 7 days"
        tone={cards.thisWeek > 0 ? "success" : "default"}
      />
      <StatCard
        label="Verified"
        value={cards.verified.toLocaleString()}
        tone="success"
        hint={
          cards.total > 0
            ? `${((cards.verified / cards.total) * 100).toFixed(1)}% of total`
            : undefined
        }
      />
      <StatCard
        label="Pending Review"
        value={cards.pending.toLocaleString()}
        tone={cards.pending > 0 ? "warning" : "default"}
      />
      <StatCard
        label="Flagged"
        value={cards.flagged.toLocaleString()}
        tone={cards.flagged > 0 ? "danger" : "default"}
      />
    </div>
  );
}
