"use client";

import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";

import type { Province } from "@/lib/constants/provinces";
import type { MainWorkFocus } from "@/lib/constants/workFocus";
import type { HasCertification } from "@/lib/constants/refrigerants";
import type { SubmissionStatus } from "@/lib/constants/challenges";
import type { YearsExperience } from "@/lib/constants/ageGroups";
import { PROVINCE_LABELS } from "@/lib/constants/provinces";
import { MAIN_WORK_FOCUS_LABELS } from "@/lib/constants/workFocus";
import { HAS_CERTIFICATION_LABELS } from "@/lib/constants/refrigerants";
import { YEARS_EXPERIENCE_LABELS } from "@/lib/constants/ageGroups";

import { MapFilters, type MapFilterState } from "./MapFilters";

export type MapMarker = {
  id: string;
  firstName: string;
  surname: string;
  province: Province;
  district: string;
  mainWorkFocus: MainWorkFocus[];
  hasCertification: HasCertification;
  status: SubmissionStatus;
  yearsExperience: YearsExperience;
  lat: number;
  lng: number;
};

const ZIMBABWE_CENTER: [number, number] = [-19.015, 29.155];
const INITIAL_ZOOM = 6;

// Status → Tailwind colour mapping for DivIcon
const STATUS_COLORS: Record<SubmissionStatus, string> = {
  pending: "#f59e0b",  // amber-400
  verified: "#10b981", // emerald-500
  flagged: "#ef4444",  // red-500
  duplicate: "#9ca3af", // gray-400
};

function makeIcon(status: SubmissionStatus) {
  const color = STATUS_COLORS[status];
  return L.divIcon({
    className: "",
    html: `<div style="
      width:14px;height:14px;border-radius:50%;
      background:${color};border:2px solid white;
      box-shadow:0 1px 3px rgba(0,0,0,.4);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });
}

// ─── Heatmap layer via useMap ────────────────────────────────────────────────

type HeatPoint = [number, number, number];

// Extend Window to avoid TS complaints about leaflet.heat
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    L: any;
  }
}

function HeatmapLayer({ points }: { points: HeatPoint[] }) {
  const map = useMap();
  const layerRef = useRef<L.Layer | null>(null);

  useEffect(() => {
    // leaflet.heat attaches to L.heatLayer
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const heat = (L as any).heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      gradient: { 0.4: "#06b6d4", 0.65: "#f59e0b", 1: "#ef4444" },
    });
    heat.addTo(map);
    layerRef.current = heat;

    return () => {
      map.removeLayer(heat);
    };
  }, [map, points]);

  return null;
}

// ─── Marker layer ─────────────────────────────────────────────────────────────

function MarkersLayer({ markers }: { markers: MapMarker[] }) {
  return (
    <MarkerClusterGroup chunkedLoading>
      {markers.map((m) => {
        const icon = makeIcon(m.status);
        const certLabel = HAS_CERTIFICATION_LABELS[m.hasCertification];
        const focusLabel =
          m.mainWorkFocus.length === 0
            ? "—"
            : m.mainWorkFocus
                .map((f) => MAIN_WORK_FOCUS_LABELS[f] ?? f)
                .join(", ");
        const yearsLabel = YEARS_EXPERIENCE_LABELS[m.yearsExperience];
        const statusColor = STATUS_COLORS[m.status];

        const popupHtml = `
          <div style="min-width:180px;font-family:sans-serif;font-size:13px;line-height:1.5">
            <p style="font-weight:600;margin:0 0 4px">${m.firstName} ${m.surname}</p>
            <p style="margin:0;color:#555">${m.district}, ${PROVINCE_LABELS[m.province]}</p>
            <p style="margin:2px 0;color:#555">${focusLabel}</p>
            <p style="margin:2px 0;color:#555">Experience: ${yearsLabel}</p>
            <span style="
              display:inline-block;padding:2px 8px;border-radius:999px;
              background:${statusColor}22;color:${statusColor};
              border:1px solid ${statusColor}66;font-size:11px;font-weight:600;
              margin-top:4px;text-transform:capitalize
            ">${m.status}</span>
            <br/>
            <span style="font-size:11px;color:#777;display:inline-block;margin-top:4px">
              Certification: ${certLabel}
            </span>
          </div>
        `;

        return (
          <MarkerWithPopup
            key={m.id}
            position={[m.lat, m.lng]}
            icon={icon}
            popupHtml={popupHtml}
          />
        );
      })}
    </MarkerClusterGroup>
  );
}

// Separate component to avoid hook-in-loop
function MarkerWithPopup({
  position,
  icon,
  popupHtml,
}: {
  position: [number, number];
  icon: L.DivIcon;
  popupHtml: string;
}) {
  return (
    <Marker position={position} icon={icon}>
      <Popup>
        <div dangerouslySetInnerHTML={{ __html: popupHtml }} />
      </Popup>
    </Marker>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

type TechniciansMapProps = {
  markers: MapMarker[];
};

export function TechniciansMap({ markers }: TechniciansMapProps) {
  const [filters, setFilters] = useState<MapFilterState>({
    province: "",
    mainWorkFocus: "",
    hasCertification: "",
    yearsExperience: "",
    status: "",
  });
  const [heatmap, setHeatmap] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [exporting, setExporting] = useState(false);

  const filtered = useMemo(() => {
    return markers.filter((m) => {
      if (filters.province && m.province !== filters.province) return false;
      if (
        filters.mainWorkFocus &&
        !m.mainWorkFocus.includes(filters.mainWorkFocus as MainWorkFocus)
      )
        return false;
      if (filters.hasCertification && m.hasCertification !== filters.hasCertification) return false;
      if (filters.yearsExperience && m.yearsExperience !== filters.yearsExperience) return false;
      if (filters.status && m.status !== filters.status) return false;
      return true;
    });
  }, [markers, filters]);

  const heatPoints = useMemo<HeatPoint[]>(
    () => filtered.map((m) => [m.lat, m.lng, 1]),
    [filtered],
  );

  const handleExportGeoJSON = useCallback(async () => {
    setExporting(true);
    try {
      const body = {
        format: "geojson",
        filters: {
          province: filters.province || undefined,
          mainWorkFocus: filters.mainWorkFocus || undefined,
          hasCertification: filters.hasCertification || undefined,
          yearsExperience: filters.yearsExperience || undefined,
          status: filters.status || undefined,
        },
        sections: {
          background: true,
          skills: true,
          tools: true,
          challenges: true,
          energy: true,
          consent: true,
        },
        anonymise: false,
        includePhotos: false,
      };

      const res = await fetch("/api/admin/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `technicians-map-${Date.now()}.geojson`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Inline error: silent fail with console
      console.error("GeoJSON export failed");
    } finally {
      setExporting(false);
    }
  }, [filters]);

  return (
    <div className="relative flex h-[calc(100vh-120px)] min-h-[500px] overflow-hidden rounded-xl border border-slate-200">
      {/* Toolbar */}
      <div className="absolute left-0 right-0 top-0 z-[1000] flex items-center gap-2 border-b border-slate-200 bg-white/90 px-3 py-2 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => setSidebarOpen((v) => !v)}
          className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          {sidebarOpen ? "Hide filters" : "Show filters"}
        </button>

        <button
          type="button"
          onClick={() => setHeatmap((v) => !v)}
          className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
            heatmap
              ? "border-brand-600 bg-brand-600 text-white"
              : "border-slate-300 text-slate-700 hover:bg-slate-50"
          }`}
        >
          Heatmap
        </button>

        <span className="ml-auto text-xs text-slate-500">
          {filtered.length} of {markers.length} technicians
        </span>

        <button
          type="button"
          onClick={handleExportGeoJSON}
          disabled={exporting}
          className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          {exporting ? "Exporting..." : "Export GeoJSON"}
        </button>
      </div>

      {/* Sidebar */}
      {sidebarOpen && (
        <div className="absolute bottom-0 left-0 top-10 z-[999] w-64 overflow-y-auto border-r border-slate-200 bg-white/95 pt-2 shadow-md backdrop-blur-sm">
          <MapFilters value={filters} onChange={setFilters} />
        </div>
      )}

      {/* Map */}
      <div className={`h-full w-full pt-10 ${sidebarOpen ? "pl-64" : ""}`}>
        <MapContainer
          center={ZIMBABWE_CENTER}
          zoom={INITIAL_ZOOM}
          scrollWheelZoom
          className="h-full w-full"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {heatmap ? (
            <HeatmapLayer points={heatPoints} />
          ) : (
            <MarkersLayer markers={filtered} />
          )}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-[1000] rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-xs shadow-sm backdrop-blur-sm">
        <p className="mb-1.5 font-semibold text-slate-700">Status</p>
        {(Object.entries(STATUS_COLORS) as [SubmissionStatus, string][]).map(([s, c]) => (
          <div key={s} className="flex items-center gap-1.5 capitalize">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: c }} />
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}
