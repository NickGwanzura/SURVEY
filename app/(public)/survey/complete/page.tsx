import Link from "next/link";

import { Button } from "@/components/ui/Button";

type SearchParams = Promise<{ ref?: string; offline?: string }>;

export const metadata = {
  title: "Thank you — RAC Technician Registry",
};

export default async function CompletePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const reference = params.ref;
  const isOffline = params.offline === "1";

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-emerald-900">
          {isOffline ? "Saved on your device" : "Thank you for registering"}
        </h1>
        <p className="mt-3 text-base text-emerald-900/90">
          {isOffline
            ? "You are currently offline. Your response is stored on this device and will sync automatically when you reconnect."
            : "Your response has been received. The NOU and HEVACRAZ teams will review your submission and may contact you for verification."}
        </p>
        {!isOffline && reference ? (
          <p className="mt-4 rounded-md border border-emerald-200 bg-white p-3 text-sm text-emerald-900">
            <span className="font-medium">Reference number:</span>{" "}
            <span className="font-mono tracking-wider">{reference}</span>
            <span className="mt-1 block text-xs text-emerald-900/80">
              Keep this for your records.
            </span>
          </p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">What happens next?</h2>
        <ul className="mt-2 flex flex-col gap-1 text-sm text-slate-700">
          <li>• NOU and HEVACRAZ will review your submission.</li>
          <li>
            • If you opted in, you may be contacted for verification or
            training programme invitations.
          </li>
          <li>
            • Once verified, your details will appear in the public registry
            only if you gave explicit consent.
          </li>
        </ul>
      </section>

      <Link href="/" className="self-start">
        <Button variant="secondary">Back to home</Button>
      </Link>
    </div>
  );
}
