import Link from "next/link";

import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-brand-600">
          National Ozone Unit · HEVACRAZ
        </p>
        <h1 className="mt-2 text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl">
          Zimbabwe RAC Technician Self-Registration
        </h1>
        <p className="mt-3 text-base text-slate-700">
          Help us build the National HVAC-R Technician Registry. Your responses
          will inform training, regulation and Montreal Protocol compliance
          reporting in Zimbabwe.
        </p>
        <ul className="mt-4 flex flex-col gap-1 text-sm text-slate-600">
          <li>• Takes about 10–15 minutes to complete.</li>
          <li>• Works offline — your answers sync when you reconnect.</li>
          <li>• You can save and continue on the same device.</li>
        </ul>

        <Link href="/survey" className="mt-6 inline-block">
          <Button size="lg">Start the survey</Button>
        </Link>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Privacy and data use
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          The information you provide is collected by the National Ozone Unit
          (NOU) and HEVACRAZ for the purpose of building the National HVAC-R
          Technician Registry, designing training programmes, and preparing
          policy reports under the Montreal Protocol and Kigali Amendment.
        </p>
        <ul className="mt-3 flex flex-col gap-1 text-sm text-slate-700">
          <li>
            • Only NOU and HEVACRAZ administrators can view your full record.
          </li>
          <li>
            • A public registry will only show your name and certification
            details if you give explicit consent.
          </li>
          <li>• You may request deletion of your record at any time.</li>
          <li>• We do not use third-party trackers or marketing analytics.</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          What you will need
        </h2>
        <ul className="mt-2 flex flex-col gap-1 text-sm text-slate-700">
          <li>• Your full name as it appears on identification.</li>
          <li>• A valid Zimbabwe phone number (+263).</li>
          <li>
            • Your training and certification details (if any) — names of
            institutions and the year you qualified.
          </li>
          <li>
            • Optional: a profile photo for the verified public registry.
          </li>
        </ul>
      </section>
    </div>
  );
}
