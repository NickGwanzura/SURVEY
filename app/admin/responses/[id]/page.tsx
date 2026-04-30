import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { LeafletReadOnlyPinLoader } from "@/components/admin/responses/LeafletReadOnlyPinLoader";

import { Badge } from "@/components/admin/Badge";
import { LikertDots } from "@/components/admin/LikertDots";
import {
  ResponseDetailSection,
  DetailRow,
  DetailGrid,
} from "@/components/admin/responses/ResponseDetailSection";
import { AdminActionPanel } from "@/components/admin/responses/AdminActionPanel";
import { PhotoModal } from "@/components/admin/responses/PhotoModal";
import {
  GENDER_LABELS,
  AGE_GROUP_LABELS,
  EDUCATION_LEVEL_LABELS,
  YEARS_EXPERIENCE_LABELS,
  MAIN_WORK_FOCUS_LABELS,
  PROVINCE_LABELS,
  PREFERRED_LANGUAGE_LABELS,
  LOAD_SHEDDING_FREQUENCY_LABELS,
  RECOVERY_EQUIPMENT_USE_LABELS,
  PPE_ACCESS_LABELS,
  BIGGEST_DAILY_CHALLENGE_LABELS,
  ENERGY_EFFICIENT_INSTALL_LABELS,
  CERTIFICATION_TYPE_LABELS,
  EHS_BARRIER_LABELS,
  ENERGY_EFFICIENT_BARRIER_LABELS,
  HAS_CERTIFICATION_LABELS,
} from "@/lib/admin/labels";
import { getResponseById } from "@/lib/admin/responses-data";
import type { Province } from "@/lib/constants/provinces";
import type { Gender } from "@/lib/constants/ageGroups";
import type { AgeGroup, YearsExperience } from "@/lib/constants/ageGroups";
import type { EducationLevel } from "@/lib/constants/educationLevels";
import type { MainWorkFocus } from "@/lib/constants/workFocus";
import type {
  BiggestDailyChallenge,
  EnergyEfficientInstall,
  LoadSheddingFrequency,
  PpeAccess,
  PreferredLanguage,
  RecoveryEquipmentUse,
  SubmissionStatus,
} from "@/lib/constants/challenges";
import type { HasCertification } from "@/lib/constants/refrigerants";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const data = await getResponseById(id);
  if (!data) return { title: "Not found | Admin" };
  return { title: `${data.firstName} ${data.surname} | Admin` };
}

function YesNoBadge({ value }: { value: boolean }) {
  return value ? (
    <Badge tone="success">Yes</Badge>
  ) : (
    <Badge tone="danger">No</Badge>
  );
}

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Harare",
  });
}

function ChipList({ items, labels }: { items: string[]; labels: Record<string, string> }) {
  if (!items || items.length === 0) return <span className="text-slate-400">—</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <Badge key={item} tone="neutral">
          {labels[item] ?? item}
        </Badge>
      ))}
    </div>
  );
}

export default async function ResponseDetailPage({ params }: PageProps) {
  const { id } = await params;
  const data = await getResponseById(id);
  if (!data) notFound();

  const { audit, ...survey } = data;

  const hasGps =
    survey.gpsLatitude !== null &&
    survey.gpsLatitude !== undefined &&
    survey.gpsLongitude !== null &&
    survey.gpsLongitude !== undefined;

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link href="/admin/responses" className="hover:underline">
              Responses
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-slate-900 font-medium">
            {survey.firstName} {survey.surname}
          </li>
        </ol>
      </nav>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        {/* Left column — detail sections */}
        <div className="flex flex-1 flex-col gap-6">
          {/* Section 1 — Background */}
          <ResponseDetailSection title="Background">
            <DetailGrid>
              <DetailRow label="Full name">
                {survey.firstName} {survey.surname}
              </DetailRow>
              <DetailRow label="Gender">
                {GENDER_LABELS[survey.gender as Gender]}
              </DetailRow>
              <DetailRow label="Age group">
                {AGE_GROUP_LABELS[survey.ageGroup as AgeGroup]}
              </DetailRow>
              <DetailRow label="Education">
                {EDUCATION_LEVEL_LABELS[survey.educationLevel as EducationLevel]}
              </DetailRow>
              <DetailRow label="Years of experience">
                {YEARS_EXPERIENCE_LABELS[survey.yearsExperience as YearsExperience]}
              </DetailRow>
              <DetailRow label="Main work focus">
                {MAIN_WORK_FOCUS_LABELS[survey.mainWorkFocus as MainWorkFocus]}
                {survey.mainWorkFocusOther ? (
                  <span className="ml-1 text-slate-500">({survey.mainWorkFocusOther})</span>
                ) : null}
              </DetailRow>
              <DetailRow label="Province">
                {PROVINCE_LABELS[survey.province as Province]}
              </DetailRow>
              <DetailRow label="District">{survey.district}</DetailRow>
              <DetailRow label="City / town">{survey.city}</DetailRow>
              <DetailRow label="Suburb / area">{survey.suburb}</DetailRow>
              <DetailRow label="Phone (full)">{survey.phone}</DetailRow>
              <DetailRow label="Email">{survey.email ?? "—"}</DetailRow>
              <DetailRow label="Submitted">
                <time dateTime={survey.submittedAt.toISOString()}>
                  {formatDate(survey.submittedAt)}
                </time>
              </DetailRow>
              <DetailRow label="Created">
                <time dateTime={survey.createdAt.toISOString()}>
                  {formatDate(survey.createdAt)}
                </time>
              </DetailRow>
              <DetailRow label="Last updated">
                <time dateTime={survey.updatedAt.toISOString()}>
                  {formatDate(survey.updatedAt)}
                </time>
              </DetailRow>
            </DetailGrid>

            {hasGps ? (
              <div className="mt-4">
                <p className="mb-2 text-xs font-medium text-slate-500">GPS location</p>
                <LeafletReadOnlyPinLoader
                  lat={Number(survey.gpsLatitude)}
                  lng={Number(survey.gpsLongitude)}
                  accuracy={survey.gpsAccuracyMeters ? Number(survey.gpsAccuracyMeters) : undefined}
                />
              </div>
            ) : null}
          </ResponseDetailSection>

          {/* Section 2 — Skills & Training */}
          <ResponseDetailSection title="Skills & Training">
            <DetailGrid>
              <DetailRow label="Formal training">
                <YesNoBadge value={survey.hasFormalTraining} />
              </DetailRow>
              {survey.hasFormalTraining ? (
                <>
                  <DetailRow label="Training institution">
                    {survey.trainingInstitution ?? "—"}
                  </DetailRow>
                  <DetailRow label="Training year">
                    {survey.trainingYear ?? "—"}
                  </DetailRow>
                </>
              ) : null}
              <DetailRow label="Certification status">
                {HAS_CERTIFICATION_LABELS[survey.hasCertification as HasCertification]}
              </DetailRow>
              <DetailRow label="Certifications held">
                <ChipList
                  items={survey.certificationsHeld ?? []}
                  labels={CERTIFICATION_TYPE_LABELS as Record<string, string>}
                />
              </DetailRow>
              <DetailRow label="HEVACRAZ member no.">
                {survey.hevacrazMemberNumber ?? "—"}
              </DetailRow>
            </DetailGrid>

            <div className="mt-4 flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Confidence &amp; access (Likert 1–5)
              </p>
              <LikertDots
                value={survey.confidenceTraditionalRefrigerants}
                label="Confidence — traditional refrigerants"
              />
              <LikertDots
                value={survey.confidenceLowGwpRefrigerants}
                label="Confidence — low-GWP refrigerants"
              />
              <LikertDots
                value={survey.accessToTools}
                label="Access to tools &amp; equipment"
              />
              <LikertDots
                value={survey.accessToSpareParts}
                label="Access to spare parts"
              />
              <LikertDots
                value={survey.accessToLowGwpRefrigerants}
                label="Access to low-GWP refrigerants"
              />
            </div>
          </ResponseDetailSection>

          {/* Section 3 — Tools & Resources */}
          <ResponseDetailSection title="Tools & Resources">
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Obstacles (1 = not a barrier, 5 = major barrier)
              </p>
              <LikertDots
                value={survey.obstacleHighImportCosts}
                label="High import costs"
              />
              <LikertDots
                value={survey.obstacleForexShortages}
                label="Forex shortages"
              />
              <LikertDots
                value={survey.obstacleUnreliableSuppliers}
                label="Unreliable suppliers"
              />
              <LikertDots
                value={survey.obstacleCounterfeitProducts}
                label="Counterfeit products"
              />
            </div>
            {survey.obstaclesOther ? (
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                  Other obstacles
                </p>
                <p className="text-sm text-slate-800">{survey.obstaclesOther}</p>
              </div>
            ) : null}
          </ResponseDetailSection>

          {/* Section 4 — Work Challenges */}
          <ResponseDetailSection title="Work Challenges">
            <DetailGrid>
              <DetailRow label="Biggest daily challenge">
                {BIGGEST_DAILY_CHALLENGE_LABELS[survey.biggestDailyChallenge as BiggestDailyChallenge]}
                {survey.biggestDailyChallengeOther ? (
                  <span className="ml-1 text-slate-500">
                    ({survey.biggestDailyChallengeOther})
                  </span>
                ) : null}
              </DetailRow>
              <DetailRow label="Load shedding frequency">
                {LOAD_SHEDDING_FREQUENCY_LABELS[survey.loadSheddingFrequency as LoadSheddingFrequency]}
              </DetailRow>
              <DetailRow label="Recovery equipment use">
                {RECOVERY_EQUIPMENT_USE_LABELS[survey.refrigerantRecoveryEquipmentUse as RecoveryEquipmentUse]}
              </DetailRow>
              <DetailRow label="PPE access">
                {PPE_ACCESS_LABELS[survey.ppeAccess as PpeAccess]}
              </DetailRow>
              <DetailRow label="EHS compliance barriers">
                <ChipList
                  items={survey.ehsComplianceBarriers}
                  labels={EHS_BARRIER_LABELS as Record<string, string>}
                />
              </DetailRow>
              {survey.ehsComplianceBarriersOther ? (
                <DetailRow label="EHS other">
                  {survey.ehsComplianceBarriersOther}
                </DetailRow>
              ) : null}
            </DetailGrid>
          </ResponseDetailSection>

          {/* Section 5 — Energy Efficiency */}
          <ResponseDetailSection title="Energy Efficiency">
            <DetailGrid>
              <DetailRow label="Installs energy-efficient">
                {ENERGY_EFFICIENT_INSTALL_LABELS[survey.installsEnergyEfficient as EnergyEfficientInstall]}
              </DetailRow>
              <DetailRow label="Barriers to EE adoption">
                <ChipList
                  items={survey.energyEfficientBarriers ?? []}
                  labels={ENERGY_EFFICIENT_BARRIER_LABELS as Record<string, string>}
                />
              </DetailRow>
              {survey.energyEfficientBarriersOther ? (
                <DetailRow label="EE other">
                  {survey.energyEfficientBarriersOther}
                </DetailRow>
              ) : null}
            </DetailGrid>
          </ResponseDetailSection>

          {/* Section 6 — Consent & Submission */}
          <ResponseDetailSection title="Consent & Submission">
            <DetailGrid>
              <DetailRow label="Consent to contact">
                <YesNoBadge value={survey.consentToContact} />
              </DetailRow>
              <DetailRow label="Consent to public registry">
                <YesNoBadge value={survey.consentToPublicRegistry} />
              </DetailRow>
              <DetailRow label="Preferred language">
                {PREFERRED_LANGUAGE_LABELS[survey.preferredLanguage as PreferredLanguage]}
              </DetailRow>
              <DetailRow label="Submission source">
                {survey.submissionSource}
              </DetailRow>
              <DetailRow label="IP address">{survey.ipAddress ?? "—"}</DetailRow>
              <DetailRow label="User agent">
                <span className="break-all text-xs text-slate-500">
                  {survey.userAgent ?? "—"}
                </span>
              </DetailRow>
              {survey.profilePhotoUrl ? (
                <DetailRow label="Profile photo">
                  <PhotoModal
                    src={survey.profilePhotoUrl}
                    alt={`${survey.firstName} ${survey.surname} profile photo`}
                  />
                </DetailRow>
              ) : null}
            </DetailGrid>
          </ResponseDetailSection>

          {/* Audit trail */}
          <ResponseDetailSection title="Audit trail">
            {audit.length === 0 ? (
              <p className="text-sm text-slate-500">No audit events yet.</p>
            ) : (
              <ol className="flex flex-col gap-3">
                {audit.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex flex-col gap-0.5 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-semibold text-brand-700">
                        {entry.action}
                      </span>
                      <time
                        dateTime={entry.createdAt.toISOString()}
                        className="text-xs text-slate-400"
                      >
                        {formatDate(entry.createdAt)}
                      </time>
                    </div>
                    <p className="text-xs text-slate-600">
                      By{" "}
                      <span className="font-medium text-slate-800">
                        {entry.actorName}
                      </span>{" "}
                      ({entry.actorEmail})
                    </p>
                    {entry.payload ? (
                      <pre className="mt-1 max-h-32 overflow-auto rounded bg-white p-2 text-[11px] text-slate-600 border border-slate-100">
                        {JSON.stringify(entry.payload, null, 2)}
                      </pre>
                    ) : null}
                  </li>
                ))}
              </ol>
            )}
          </ResponseDetailSection>
        </div>

        {/* Right column — admin actions (sticky on large screens) */}
        <div className="w-full lg:sticky lg:top-8 lg:w-72 lg:shrink-0">
          <AdminActionPanel
            surveyId={survey.id}
            currentStatus={survey.status as SubmissionStatus}
            currentNotes={survey.notes}
          />
        </div>
      </div>
    </div>
  );
}
