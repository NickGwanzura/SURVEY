import Link from "next/link";

import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Offline — RAC Technician Registry",
};

export default function OfflinePage() {
  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-amber-900">
          You are offline
        </h1>
        <p className="mt-3 text-base text-amber-900/90">
          Don&apos;t worry — you can still complete the survey. Your answers
          are saved on this device. As soon as your phone reconnects to the
          internet, your response will be sent automatically.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Tips for working offline
        </h2>
        <ul className="mt-2 flex flex-col gap-1 text-sm text-slate-700">
          <li>• Photos can still be captured and will be uploaded later.</li>
          <li>
            • GPS works without the internet — your location will be saved
            with your response.
          </li>
          <li>
            • Move closer to a window or open area to improve mobile signal
            and trigger sync.
          </li>
        </ul>
      </section>

      <Link href="/survey" className="self-start">
        <Button>Continue with the survey</Button>
      </Link>
    </div>
  );
}
