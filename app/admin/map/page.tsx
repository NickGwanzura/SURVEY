import { isNotNull } from "drizzle-orm";
import { redirect } from "next/navigation";

import { TechniciansMapLoader } from "@/components/admin/map/TechniciansMapLoader";
import type { MapMarker } from "@/components/admin/map/TechniciansMap";
import { getCurrentAdmin } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { techniciansSurvey } from "@/lib/schema";

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const rows = await db
    .select({
      id: techniciansSurvey.id,
      firstName: techniciansSurvey.firstName,
      surname: techniciansSurvey.surname,
      province: techniciansSurvey.province,
      mainWorkFocus: techniciansSurvey.mainWorkFocus,
      hasCertification: techniciansSurvey.hasCertification,
      status: techniciansSurvey.status,
      yearsExperience: techniciansSurvey.yearsExperience,
      gpsLatitude: techniciansSurvey.gpsLatitude,
      gpsLongitude: techniciansSurvey.gpsLongitude,
    })
    .from(techniciansSurvey)
    .where(isNotNull(techniciansSurvey.gpsLatitude));

  const markers: MapMarker[] = rows
    .filter((r) => r.gpsLatitude != null && r.gpsLongitude != null)
    .map((r) => ({
      id: r.id,
      firstName: r.firstName,
      surname: r.surname,
      province: r.province,
      mainWorkFocus: r.mainWorkFocus ?? [],
      hasCertification: r.hasCertification,
      status: r.status,
      yearsExperience: r.yearsExperience,
      lat: parseFloat(String(r.gpsLatitude)),
      lng: parseFloat(String(r.gpsLongitude)),
    }))
    .filter((m) => !isNaN(m.lat) && !isNaN(m.lng));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Technician Map</h1>
          <p className="mt-1 text-sm text-slate-500">
            {markers.length} technician{markers.length !== 1 ? "s" : ""} with GPS coordinates
          </p>
        </div>
      </div>

      <TechniciansMapLoader markers={markers} />
    </div>
  );
}
