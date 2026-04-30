"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

import { Button } from "@/components/ui/Button";

type GpsValue = {
  latitude: number | null;
  longitude: number | null;
  accuracyMeters: number | null;
};

type GpsCaptureProps = {
  value: GpsValue;
  onChange: (next: GpsValue) => void;
};

const LeafletMap = dynamic(() => import("./LeafletPicker").then((m) => m.LeafletPicker), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 w-full items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-500">
      Loading map…
    </div>
  ),
});

export function GpsCapture({ value, onChange }: GpsCaptureProps) {
  const [status, setStatus] = useState<
    "idle" | "requesting" | "success" | "denied" | "unavailable"
  >("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const requestedRef = useRef(false);

  const requestLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("unavailable");
      setErrorMsg("Your browser does not support GPS location.");
      return;
    }
    setStatus("requesting");
    setErrorMsg(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracyMeters: pos.coords.accuracy ?? null,
        });
        setStatus("success");
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus("denied");
          setErrorMsg(
            "Location permission denied. Your district and city information will still help us locate you.",
          );
        } else {
          setStatus("unavailable");
          setErrorMsg(
            "We could not get your GPS location. Your district and city information will still help us locate you.",
          );
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  };

  useEffect(() => {
    if (
      !requestedRef.current &&
      value.latitude == null &&
      value.longitude == null
    ) {
      requestedRef.current = true;
      requestLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasFix = value.latitude != null && value.longitude != null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={requestLocation}
          loading={status === "requesting"}
        >
          {hasFix ? "Refresh my location" : "Use my current location"}
        </Button>
        {hasFix ? (
          <span className="text-xs text-slate-600">
            Lat {value.latitude!.toFixed(5)}, Lng {value.longitude!.toFixed(5)}
            {value.accuracyMeters
              ? ` · ±${Math.round(value.accuracyMeters)}m`
              : null}
          </span>
        ) : null}
      </div>

      {errorMsg ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          {errorMsg}
        </p>
      ) : null}

      <div className="h-64 w-full overflow-hidden rounded-lg border border-slate-200">
        <LeafletMap
          latitude={value.latitude}
          longitude={value.longitude}
          onChange={(lat, lng) =>
            onChange({
              latitude: lat,
              longitude: lng,
              accuracyMeters: value.accuracyMeters,
            })
          }
        />
      </div>
      <p className="text-xs text-slate-500">
        Drag the pin to correct your exact location if needed.
      </p>
    </div>
  );
}
