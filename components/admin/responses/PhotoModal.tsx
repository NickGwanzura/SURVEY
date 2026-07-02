"use client";

import { useState } from "react";
import Image from "next/image";

import { Modal } from "@/components/ui/Modal";

const SIZE_MAP = {
  sm: "h-10 w-10 rounded-full",
  md: "h-20 w-20 rounded-xl",
} as const;

type Props = {
  src: string;
  alt: string;
  size?: keyof typeof SIZE_MAP;
};

export function PhotoModal({ src, alt, size = "md" }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={`group relative overflow-hidden border border-slate-200 shadow-sm focus-visible:outline-2 focus-visible:outline-brand-600 ${SIZE_MAP[size]}`}
        aria-label={`Open ${alt} full size`}
        onClick={() => setOpen(true)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition group-hover:bg-black/25 group-hover:opacity-100 text-xs font-semibold">
          Enlarge
        </span>
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={alt}>
        <div className="flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="max-h-[70vh] max-w-full rounded-lg object-contain"
          />
        </div>
      </Modal>
    </>
  );
}
