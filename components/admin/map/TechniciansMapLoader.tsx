"use client";

import dynamic from "next/dynamic";

import type { MapMarker } from "./TechniciansMap";

const TechniciansMap = dynamic(
  () => import("./TechniciansMap").then((m) => m.TechniciansMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[calc(100vh-120px)] min-h-[500px] items-center justify-center rounded-xl border border-slate-200 bg-slate-100">
        <div className="text-sm text-slate-500">Loading map…</div>
      </div>
    ),
  },
);

export function TechniciansMapLoader({ markers }: { markers: MapMarker[] }) {
  return <TechniciansMap markers={markers} />;
}
