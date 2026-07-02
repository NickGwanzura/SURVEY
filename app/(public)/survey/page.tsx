import type { Metadata } from "next";
import { SurveyWizard } from "@/components/survey/SurveyWizard";

export const metadata: Metadata = {
  title: "Register — RAC Technician Registry",
  description: "Complete the Zimbabwe RAC Technician self-registration survey. Register with the National Ozone Unit and HEVACRAZ.",
  robots: { index: false, follow: false },
};

export default function SurveyPage() {
  return <SurveyWizard />;
}
