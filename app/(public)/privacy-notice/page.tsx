import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/Button";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://racregistryzw.org";

export const metadata: Metadata = {
  title: "Data Protection & Privacy Notice",
  description:
    "How your personal data is collected, processed, and protected by the Zimbabwe National Ozone Unit and HEVACRAZ, in accordance with the Zimbabwe Cyber and Data Protection Act [Chapter 11:07].",
  alternates: { canonical: `${APP_URL}/privacy-notice` },
  openGraph: {
    title: "Data Protection & Privacy Notice — ZW RAC Registry",
    description:
      "How the Zimbabwe NOU and HEVACRAZ handle your personal data under the Zimbabwe Cyber and Data Protection Act.",
    url: `${APP_URL}/privacy-notice`,
    type: "article",
  },
  twitter: {
    card: "summary",
    title: "Privacy Notice — ZW RAC Registry",
    description: "How the Zimbabwe NOU and HEVACRAZ handle your personal data.",
  },
};

export default function PrivacyNoticePage() {
  return (
    <div className="flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-3xl border border-brand-200 bg-white p-7 shadow-sm sm:p-9">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brand-100/60 blur-3xl"
          aria-hidden
        />
        <div className="relative">
          <span
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 shadow-sm ring-1 ring-brand-200"
            aria-hidden
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2.5L5 6v6c0 4.5 3.5 8.7 7 10 3.5-1.3 7-5.5 7-10V6l-7-3.5z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M9.5 12.5l2 2 3.5-5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-[34px]">
            Data Protection & Privacy Notice
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
            This notice explains how your personal data is collected, processed,
            and protected when you participate in the RAC Technician Survey and
            Registry, in accordance with the Zimbabwe Cyber and Data Protection
            Act [Chapter 11:07].
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="space-y-6 text-sm leading-relaxed text-slate-700">
          <Section heading="1. Who we are">
            <p>
              This survey is administered by the{" "}
              <strong>National Ozone Unit (NOU) of Zimbabwe</strong>, operating
              under the Ministry of Environment, Climate and Wildlife, in
              partnership with the{" "}
              <strong>
                Heating, Ventilation, Air Conditioning and Refrigeration
                Association of Zimbabwe (HEVACRAZ)
              </strong>
              . The programme is conducted under the guidance of the{" "}
              <strong>United Nations Environment Programme (UNEP)</strong>.
            </p>
          </Section>

          <Section heading="2. What personal data we collect">
            <p>We may collect the following categories of personal data:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <strong>Identity data:</strong> full name, gender, age group,
                education level
              </li>
              <li>
                <strong>Contact data:</strong> phone number, email address,
                physical location (city, suburb), GPS coordinates
              </li>
              <li>
                <strong>Professional data:</strong> years of experience, work
                focus areas, training history, certifications, HEVACRAZ
                membership number
              </li>
              <li>
                <strong>Technical data:</strong> confidence levels, tool access,
                equipment usage, safety practices
              </li>
              <li>
                <strong>Profile photo:</strong> voluntarily provided for
                identity verification in the public registry
              </li>
              <li>
                <strong>Technical metadata:</strong> IP address, browser user
                agent, consent timestamp
              </li>
            </ul>
          </Section>

          <Section heading="3. Purpose of processing">
            <p>Your data is processed for the following purposes:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Establishing and maintaining the national RAC Technician
                Registry
              </li>
              <li>
                Assessing sector skills, training needs, and equipment gaps
              </li>
              <li>
                Informing policy and programme development for the
                refrigeration and air conditioning sector
              </li>
              <li>
                Facilitating the phase-down of hydrofluorocarbons (HFCs) under
                the Kigali Amendment to the Montreal Protocol
              </li>
              <li>
                Producing aggregated, anonymised statistical reports for UNEP
                and national stakeholders
              </li>
              <li>
                Contacting you for verification, follow-up training
                opportunities, or sector updates (where consent has been given)
              </li>
            </ul>
          </Section>

          <Section heading="4. Legal basis">
            <p>
              Processing is based on your explicit consent, as required by the
              Zimbabwe Cyber and Data Protection Act [Chapter 11:07]. By
              accepting this notice and submitting the survey, you confirm that
              you have read and understood this notice and consent to the
              processing of your personal data as described herein. You may
              withdraw your consent at any time by contacting the NOU.
            </p>
          </Section>

          <Section heading="5. Data storage and security">
            <p>
              Your data is stored in encrypted databases hosted within secure
              data centres. Access is restricted to authorised personnel of the
              NOU, HEVACRAZ, and technical administrators. All data
              transmissions are encrypted using industry-standard TLS
              protocols.
            </p>
          </Section>

          <Section heading="6. Data retention">
            <p>
              Personal data will be retained for the duration of the RAC
              Technician Registry programme plus five (5) years for archival
              and analytical purposes. After this period, personal data will be
              anonymised or securely deleted.
            </p>
          </Section>

          <Section heading="7. Your rights">
            <p>
              Under the Zimbabwe Cyber and Data Protection Act, you have the
              following rights:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <strong>Right of access:</strong> request a copy of your
                personal data
              </li>
              <li>
                <strong>Right to correction:</strong> request that inaccurate
                data be corrected
              </li>
              <li>
                <strong>Right to deletion:</strong> request that your data be
                deleted, subject to legal retention requirements
              </li>
              <li>
                <strong>Right to restriction:</strong> request that processing
                of your data be limited
              </li>
              <li>
                <strong>Right to data portability:</strong> request a copy of
                your data in a structured, machine-readable format
              </li>
              <li>
                <strong>Right to withdraw consent:</strong> withdraw your
                consent at any time without affecting the lawfulness of
                processing before withdrawal
              </li>
            </ul>
          </Section>

          <Section heading="8. Third-party sharing">
            <p>
              Your personal data will not be sold or rented to third parties.
              Aggregated, anonymised data may be shared with UNEP for the
              purposes of national reporting under the Montreal Protocol. Your
              name and professional details will only appear in the public
              technician registry if you have explicitly consented to this in
              the survey.
            </p>
          </Section>

          <Section heading="9. Contact information">
            <p>
              For any questions, concerns, or requests relating to your
              personal data, please contact:
            </p>
            <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">
                National Ozone Unit (NOU) of Zimbabwe
              </p>
              <p className="mt-0.5">
                Ministry of Environment, Climate and Wildlife
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                11th Floor, Kaguvi Building, Cnr S. Machel Avenue / Central
                Avenue, Harare, Zimbabwe
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Email: nou@environment.gov.zw
              </p>
            </div>
          </Section>

          <Section heading="10. Changes to this notice">
            <p>
              This notice may be updated from time to time. The current version
              will always be available on this page. Continued participation in
              the registry after changes constitutes acceptance of the updated
              notice.
            </p>
          </Section>

          <p className="border-t border-slate-200 pt-4 text-xs text-slate-400">
            Version 1.0 | Effective 27 May 2026 | Zimbabwe Cyber and Data
            Protection Act [Chapter 11:07]
          </p>
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/survey" className="sm:inline-block">
          <Button size="lg" className="w-full sm:w-auto">
            Take the survey
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden
            >
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
        </Link>
        <Link href="/" className="sm:inline-block">
          <Button variant="ghost" size="lg" className="w-full sm:w-auto">
            Back to home
          </Button>
        </Link>
      </div>
    </div>
  );
}

function Section({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-1 text-base font-semibold text-slate-900">
        {heading}
      </h2>
      {children}
    </section>
  );
}
