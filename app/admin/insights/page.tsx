import { redirect } from "next/navigation";

import { getCurrentAdmin } from "@/lib/auth-server";
import { getInsightsData } from "@/lib/admin/insights-data";
import { EmptyState } from "@/components/admin/EmptyState";
import { SkillsSection } from "@/components/admin/insights/SkillsSection";
import { ResourcesSection } from "@/components/admin/insights/ResourcesSection";
import { ChallengesSection } from "@/components/admin/insights/ChallengesSection";
import { EnergySection } from "@/components/admin/insights/EnergySection";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const insights = await getInsightsData();

  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Insights</h1>
        <p className="mt-1 text-sm text-slate-500">
          Research-grade analytics across all survey responses.
          {insights.meta.sampleSize > 0 ? (
            <>
              {" "}
              Based on{" "}
              <strong className="font-semibold text-slate-700">
                {insights.meta.sampleSize.toLocaleString()}
              </strong>{" "}
              submissions. Generated{" "}
              {new Date(insights.meta.generatedAt).toLocaleString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
              .
            </>
          ) : null}
        </p>
      </div>

      {insights.meta.sampleSize === 0 ? (
        <EmptyState
          title="No responses yet"
          description="Once technicians start submitting, insights will appear here. Check back after the first registrations come in."
        />
      ) : (
        <>
          <SkillsSection {...insights.skills} />
          <ResourcesSection {...insights.resources} />
          <ChallengesSection {...insights.challenges} />
          <EnergySection {...insights.energy} />
        </>
      )}
    </div>
  );
}
