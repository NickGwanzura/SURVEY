"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/Button";

type PhotoCaptureProps = {
  value: string | undefined;
  onChange: (url: string | undefined) => void;
};

const MAX_OUTPUT_BYTES = 1_000_000; // 1 MB target

export function PhotoCapture({ value, onChange }: PhotoCaptureProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [progress, setProgress] = useState<
    "idle" | "compressing" | "uploading" | "done" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setErrorMsg(null);
    setProgress("compressing");

    try {
      const compression = await import("browser-image-compression");
      const compressed = await compression.default(file, {
        maxSizeMB: MAX_OUTPUT_BYTES / 1_000_000,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
        fileType: "image/jpeg",
      });

      const previewObjectUrl = URL.createObjectURL(compressed);
      setPreviewUrl(previewObjectUrl);

      setProgress("uploading");
      const sigRes = await fetch("/api/survey/upload-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType: compressed.type || "image/jpeg",
          byteLength: compressed.size,
        }),
      });

      if (!sigRes.ok) {
        const json = (await sigRes.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(json?.error ?? "Could not get upload URL.");
      }

      const signed = (await sigRes.json()) as {
        uploadUrl: string;
        publicUrl: string;
      };

      const uploadRes = await fetch(signed.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": compressed.type || "image/jpeg" },
        body: compressed,
      });

      if (!uploadRes.ok) {
        throw new Error("Upload to storage failed.");
      }

      onChange(signed.publicUrl);
      setProgress("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Photo upload failed.");
      setProgress("error");
    }
  };

  const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleFile(file);
  };

  const reset = () => {
    onChange(undefined);
    setPreviewUrl(null);
    setProgress("idle");
    setErrorMsg(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleSelect}
        className="hidden"
      />

      {value || previewUrl ? (
        <div className="flex flex-col gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value ?? previewUrl ?? ""}
            alt="Profile photo preview"
            className="h-40 w-40 rounded-lg border border-slate-200 object-cover"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={progress === "compressing" || progress === "uploading"}
            >
              Retake
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={reset}
              disabled={progress === "compressing" || progress === "uploading"}
            >
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="secondary"
          onClick={() => inputRef.current?.click()}
          loading={progress === "compressing" || progress === "uploading"}
        >
          {progress === "compressing"
            ? "Compressing…"
            : progress === "uploading"
              ? "Uploading…"
              : "Take or upload photo"}
        </Button>
      )}

      {errorMsg ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {errorMsg}
        </p>
      ) : null}
      {progress === "done" ? (
        <p className="text-xs text-emerald-700">Photo saved.</p>
      ) : null}
    </div>
  );
}
