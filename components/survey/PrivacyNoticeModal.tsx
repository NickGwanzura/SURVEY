"use client";

import { Modal } from "@/components/ui/Modal";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function PrivacyNoticeModal({ open, onClose }: Props) {
  return (
    <Modal open={open} onClose={onClose} title="Data Protection & Privacy Notice" size="lg">
      <div className="space-y-4 text-sm leading-relaxed text-slate-700">
        <section>
          <h3 className="mb-1 font-semibold text-slate-900">1. Who we are</h3>
          <p>
            This survey is administered by the National Ozone Unit (NOU) of
            Zimbabwe, operating under the Ministry of Environment, Climate and
            Wildlife, in partnership with the Heating, Ventilation, Air
            Conditioning and Refrigeration Association of Zimbabwe (HEVACRAZ).
            The programme is conducted under the guidance of the United Nations
            Environment Programme (UNEP).
          </p>
        </section>

        <section>
          <h3 className="mb-1 font-semibold text-slate-900">
            2. What personal data we collect
          </h3>
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
              <strong>Profile photo:</strong> voluntarily provided for identity
              verification in the public registry
            </li>
            <li>
              <strong>Technical metadata:</strong> IP address, browser user
              agent, consent timestamp
            </li>
          </ul>
        </section>

        <section>
          <h3 className="mb-1 font-semibold text-slate-900">
            3. Purpose of processing
          </h3>
          <p>Your data is processed for the following purposes:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Establishing and maintaining the national RAC Technician Registry
            </li>
            <li>
              Assessing sector skills, training needs, and equipment gaps
            </li>
            <li>
              Informing policy and programme development for the refrigeration
              and air conditioning sector
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
        </section>

        <section>
          <h3 className="mb-1 font-semibold text-slate-900">
            4. Legal basis
          </h3>
          <p>
            Processing is based on your explicit consent, as required by the
            Zimbabwe Cyber and Data Protection Act [Chapter 11:07]. By
            accepting this notice and submitting the survey, you confirm that
            you have read and understood this notice and consent to the
            processing of your personal data as described herein. You may
            withdraw your consent at any time by contacting the NOU.
          </p>
        </section>

        <section>
          <h3 className="mb-1 font-semibold text-slate-900">
            5. Data storage and security
          </h3>
          <p>
            Your data is stored in encrypted databases hosted within secure
            data centres. Access is restricted to authorised personnel of the
            NOU, HEVACRAZ, and technical administrators. All data
            transmissions are encrypted using industry-standard TLS protocols.
          </p>
        </section>

        <section>
          <h3 className="mb-1 font-semibold text-slate-900">
            6. Data retention
          </h3>
          <p>
            Personal data will be retained for the duration of the RAC
            Technician Registry programme plus five (5) years for archival and
            analytical purposes. After this period, personal data will be
            anonymised or securely deleted.
          </p>
        </section>

        <section>
          <h3 className="mb-1 font-semibold text-slate-900">
            7. Your rights
          </h3>
          <p>
            Under the Zimbabwe Cyber and Data Protection Act, you have the
            following rights:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Right of access:</strong> request a copy of your personal
              data
            </li>
            <li>
              <strong>Right to correction:</strong> request that inaccurate data
              be corrected
            </li>
            <li>
              <strong>Right to deletion:</strong> request that your data be
              deleted, subject to legal retention requirements
            </li>
            <li>
              <strong>Right to restriction:</strong> request that processing of
              your data be limited
            </li>
            <li>
              <strong>Right to data portability:</strong> request a copy of your
              data in a structured, machine-readable format
            </li>
            <li>
              <strong>Right to withdraw consent:</strong> withdraw your consent
              at any time without affecting the lawfulness of processing before
              withdrawal
            </li>
          </ul>
        </section>

        <section>
          <h3 className="mb-1 font-semibold text-slate-900">
            8. Third-party sharing
          </h3>
          <p>
            Your personal data will not be sold or rented to third parties.
            Aggregated, anonymised data may be shared with UNEP for the
            purposes of national reporting under the Montreal Protocol. Your
            name and professional details will only appear in the public
            technician registry if you have explicitly consented to this in
            the survey.
          </p>
        </section>

        <section>
          <h3 className="mb-1 font-semibold text-slate-900">
            9. Contact information
          </h3>
          <p>
            For any questions, concerns, or requests relating to your personal
            data, please contact:
          </p>
          <div className="mt-1 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="font-medium text-slate-900">
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
        </section>

        <section>
          <h3 className="mb-1 font-semibold text-slate-900">
            10. Changes to this notice
          </h3>
          <p>
            This notice may be updated from time to time. The current version
            will always be available on this page. Continued participation in
            the registry after changes constitutes acceptance of the updated
            notice.
          </p>
        </section>

        <p className="border-t border-slate-200 pt-4 text-xs text-slate-400">
          Version 1.0 | Effective 27 May 2026 | Zimbabwe Cyber and Data
          Protection Act [Chapter 11:07]
        </p>
      </div>
    </Modal>
  );
}
