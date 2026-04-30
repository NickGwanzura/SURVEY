"use client";

import "leaflet/dist/leaflet.css";

import L from "leaflet";
import { MapContainer, TileLayer, Marker, Circle } from "react-leaflet";

const pinIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type Props = {
  lat: number;
  lng: number;
  accuracy?: number;
};

export default function LeafletReadOnlyPin({ lat, lng, accuracy }: Props) {
  const center: [number, number] = [lat, lng];

  return (
    <div
      className="h-48 w-full overflow-hidden rounded-xl border border-slate-200"
      aria-label={`Map showing GPS pin at ${lat.toFixed(5)}, ${lng.toFixed(5)}`}
    >
      <MapContainer
        center={center}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        keyboard={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          maxZoom={18}
        />
        <Marker position={center} icon={pinIcon} />
        {accuracy && accuracy > 0 ? (
          <Circle
            center={center}
            radius={accuracy}
            pathOptions={{ color: "#3b82f6", weight: 1, fillOpacity: 0.1 }}
          />
        ) : null}
      </MapContainer>
    </div>
  );
}
