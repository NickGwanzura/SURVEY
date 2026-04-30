"use client";

import { useState } from "react";
import Image from "next/image";

import { Modal } from "@/components/ui/Modal";

type Props = {
  src: string;
  alt: string;
};

export function PhotoModal({ src, alt }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="group relative h-20 w-20 overflow-hidden rounded-xl border border-slate-200 shadow-sm focus-visible:outline-2 focus-visible:outline-brand-600"
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
