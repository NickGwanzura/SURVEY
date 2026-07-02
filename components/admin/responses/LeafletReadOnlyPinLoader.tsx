"use client";

import dynamic from "next/dynamic";

import type { ComponentProps } from "react";

const LeafletReadOnlyPin = dynamic(() => import("./LeafletReadOnlyPin"), {
  ssr: false,
  loading: () => (
    <div className="h-48 animate-pulse rounded-xl bg-slate-100" />
  ),
});

export function LeafletReadOnlyPinLoader(
  props: ComponentProps<typeof LeafletReadOnlyPin>,
) {
  return <LeafletReadOnlyPin {...props} />;
}
