import { notFound } from "next/navigation";

import { AdminSurveyEditor } from "@/components/admin/responses/AdminSurveyEditor";
import { getResponseById } from "@/lib/admin/responses-data";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditPage({ params }: PageProps) {
  const { id } = await params;
  const data = await getResponseById(id);
  if (!data) notFound();

  const { audit: _audit, ...survey } = data;

  return <AdminSurveyEditor survey={survey} />;
}
