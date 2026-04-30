"use client";

import "leaflet/dist/leaflet.css";

import { useEffect, useMemo } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

// Default Leaflet marker icons reference assets through bundler URLs that fail
// in Next App Router. Use the unpkg-hosted PNGs which are stable and tiny.
const defaultIcon = L.icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const ZIMBABWE_CENTER: [number, number] = [-19.015438, 29.154857];

type LeafletPickerProps = {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
};

function ClickToSet({
  onChange,
}: {
  onChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyToLocation({
  latitude,
  longitude,
}: {
  latitude: number | null;
  longitude: number | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (latitude != null && longitude != null) {
      map.flyTo([latitude, longitude], 14, { duration: 0.6 });
    }
  }, [latitude, longitude, map]);
  return null;
}

export function LeafletPicker({
  latitude,
  longitude,
  onChange,
}: LeafletPickerProps) {
  const center: [number, number] = useMemo(() => {
    if (latitude != null && longitude != null) return [latitude, longitude];
    return ZIMBABWE_CENTER;
  }, [latitude, longitude]);

  return (
    <MapContainer
      center={center}
      zoom={latitude != null ? 14 : 6}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickToSet onChange={onChange} />
      <FlyToLocation latitude={latitude} longitude={longitude} />
      {latitude != null && longitude != null ? (
        <Marker
          position={[latitude, longitude]}
          icon={defaultIcon}
          draggable
          eventHandlers={{
            dragend(e) {
              const m = e.target as L.Marker;
              const ll = m.getLatLng();
              onChange(ll.lat, ll.lng);
            },
          }}
        />
      ) : null}
    </MapContainer>
  );
}
