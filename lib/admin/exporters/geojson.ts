import type { TechnicianSurvey } from "@/lib/schema";
import { stableHash, type ExportOptions, type ExportResult } from "./types";

type GeoJsonFeature = {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: Record<string, string | number | boolean | null>;
};

type GeoJsonFeatureCollection = {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
};

export async function geojsonExporter(
  rows: TechnicianSurvey[],
  opts: ExportOptions,
): Promise<ExportResult> {
  const features: GeoJsonFeature[] = [];

  for (const row of rows) {
    if (row.gpsLatitude == null || row.gpsLongitude == null) continue;

    const lat = parseFloat(String(row.gpsLatitude));
    const lng = parseFloat(String(row.gpsLongitude));
    if (isNaN(lat) || isNaN(lng)) continue;

    const id = opts.anonymise ? await stableHash(row.id) : row.id;

    const properties: Record<string, string | number | boolean | null> = {
      id,
      province: row.province,
      district: row.district,
      mainWorkFocus: row.mainWorkFocus,
      hasCertification: row.hasCertification,
      status: row.status,
      yearsExperience: row.yearsExperience,
    };

    if (!opts.anonymise) {
      properties.name = `${row.firstName} ${row.surname}`;
    }

    features.push({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [lng, lat], // GeoJSON is [longitude, latitude]
      },
      properties,
    });
  }

  const collection: GeoJsonFeatureCollection = {
    type: "FeatureCollection",
    features,
  };

  const json = JSON.stringify(collection, null, 2);
  const buffer = Buffer.from(json, "utf-8");

  return {
    buffer,
    contentType: "application/geo+json",
    filename: `technicians-${Date.now()}.geojson`,
  };
}
