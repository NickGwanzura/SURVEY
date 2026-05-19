"use client";

import { useState } from "react";

import { cn } from "@/lib/cn";
import {
  GENDER_LABELS,
  AGE_GROUP_LABELS,
  EDUCATION_LEVEL_LABELS,
  YEARS_EXPERIENCE_LABELS,
  PROVINCE_LABELS,
} from "@/lib/admin/labels";
import { MAIN_WORK_FOCUS_LABELS } from "@/lib/constants/workFocus";
import {
  CERTIFICATION_TYPE_LABELS,
  HAS_CERTIFICATION_LABELS,
} from "@/lib/constants/refrigerants";
import {
  BIGGEST_DAILY_CHALLENGE_LABELS,
  LOAD_SHEDDING_FREQUENCY_LABELS,
  RECOVERY_EQUIPMENT_USE_LABELS,
  PPE_ACCESS_LABELS,
  ENERGY_EFFICIENT_INSTALL_LABELS,
} from "@/lib/constants/challenges";
import type { SurveySubmission } from "@/lib/validation";

type Props = {
  data: Partial<SurveySubmission>;
};

function SectionBlock({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border border-slate-200">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
        aria-expanded={open}
      >
        {title}
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden
          className={cn("transition-transform", open && "rotate-180")}
        >
          <path d="M4 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && <div className="border-t border-slate-100 px-4 py-3 text-sm text-slate-600 space-y-1.5">{children}</div>}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value || value === "" || value === "—" || value === null || value === undefined) return null;
  return (
    <div className="flex justify-between gap-2">
      <span className="font-medium text-slate-500">{label}</span>
      <span className="text-right text-slate-800 max-w-[60%]">{value}</span>
    </div>
  );
}

function formatList(items: string[] | undefined, labels: Record<string, string>): string {
  if (!items || items.length === 0) return "—";
  return items.map((i) => labels[i] ?? i).join(", ");
}

export function AnswerReview({ data }: Props) {
  const hasAnyAnswers =
    data.firstName ||
    data.surname ||
    data.hasCertification ||
    data.hasFormalTraining !== undefined ||
    data.biggestDailyChallenge ||
    data.installsEnergyEfficient;

  if (!hasAnyAnswers) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-semibold text-slate-700 mb-1">
        Review your answers before submitting
      </p>

      {data.firstName ? (
        <SectionBlock title="Background Information" defaultOpen>
          <ReviewRow label="Full name" value={`${data.firstName ?? ""} ${data.surname ?? ""}`} />
          <ReviewRow label="Gender" value={data.gender ? GENDER_LABELS[data.gender] : undefined} />
          <ReviewRow label="Age group" value={data.ageGroup ? AGE_GROUP_LABELS[data.ageGroup] : undefined} />
          <ReviewRow label="Education" value={data.educationLevel ? EDUCATION_LEVEL_LABELS[data.educationLevel] : undefined} />
          <ReviewRow label="Experience" value={data.yearsExperience ? YEARS_EXPERIENCE_LABELS[data.yearsExperience] : undefined} />
          <ReviewRow label="Work focus" value={formatList(data.mainWorkFocus as string[], MAIN_WORK_FOCUS_LABELS)} />
          <ReviewRow label="Province" value={data.province ? PROVINCE_LABELS[data.province] : undefined} />
          <ReviewRow label="City" value={data.city} />
          <ReviewRow label="Suburb" value={data.suburb} />
          <ReviewRow label="Phone" value={data.phone} />
          <ReviewRow label="Email" value={data.email} />
        </SectionBlock>
      ) : null}

      {(data.hasCertification || data.hasFormalTraining !== undefined) ? (
        <SectionBlock title="Skills & Training">
          <ReviewRow label="Formal training" value={data.hasFormalTraining ? "Yes" : "No"} />
          <ReviewRow label="Training institution" value={data.trainingInstitution} />
          <ReviewRow label="Training year" value={data.trainingYear?.toString()} />
          <ReviewRow label="Certification" value={data.hasCertification ? HAS_CERTIFICATION_LABELS[data.hasCertification] : undefined} />
          <ReviewRow label="Certifications" value={formatList(data.certificationsHeld as string[], CERTIFICATION_TYPE_LABELS)} />
          <ReviewRow label="HEVACRAZ no." value={data.hevacrazMemberNumber} />
        </SectionBlock>
      ) : null}

      {(data.accessToTools || data.obstacleHighImportCosts) ? (
        <SectionBlock title="Tools & Resources">
          <ReviewRow label="Access: Tools" value={data.accessToTools ? `${data.accessToTools}/5` : undefined} />
          <ReviewRow label="Access: Spare parts" value={data.accessToSpareParts ? `${data.accessToSpareParts}/5` : undefined} />
          <ReviewRow label="Access: Low-GWP" value={data.accessToLowGwpRefrigerants ? `${data.accessToLowGwpRefrigerants}/5` : undefined} />
          <ReviewRow label="Other obstacles" value={data.obstaclesOther} />
        </SectionBlock>
      ) : null}

      {data.biggestDailyChallenge ? (
        <SectionBlock title="Work Challenges">
          <ReviewRow label="Daily challenge" value={data.biggestDailyChallenge ? BIGGEST_DAILY_CHALLENGE_LABELS[data.biggestDailyChallenge] : undefined} />
          <ReviewRow label="Load shedding" value={data.loadSheddingFrequency ? LOAD_SHEDDING_FREQUENCY_LABELS[data.loadSheddingFrequency] : undefined} />
          <ReviewRow label="Recovery equipment" value={data.refrigerantRecoveryEquipmentUse ? RECOVERY_EQUIPMENT_USE_LABELS[data.refrigerantRecoveryEquipmentUse] : undefined} />
          <ReviewRow label="PPE access" value={data.ppeAccess ? PPE_ACCESS_LABELS[data.ppeAccess] : undefined} />
        </SectionBlock>
      ) : null}

      {data.installsEnergyEfficient ? (
        <SectionBlock title="Energy Efficiency">
          <ReviewRow label="Installs EE" value={data.installsEnergyEfficient ? ENERGY_EFFICIENT_INSTALL_LABELS[data.installsEnergyEfficient] : undefined} />
        </SectionBlock>
      ) : null}
    </div>
  );
}
