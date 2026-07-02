import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Zimbabwe RAC Technician Registry",
    short_name: "RAC Registry",
    description:
      "Self-registration survey for HVAC-R technicians operating in Zimbabwe — National Ozone Unit and HEVACRAZ.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f8fafc",
    theme_color: "#0d4f3c",
    lang: "en",
    dir: "ltr",
    categories: ["productivity", "utilities", "government"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Start the survey",
        short_name: "Survey",
        url: "/survey",
        description: "Begin a new technician registration",
      },
      {
        name: "Admin dashboard",
        short_name: "Admin",
        url: "/admin/dashboard",
        description: "NOU / HEVACRAZ administration",
      },
    ],
    prefer_related_applications: false,
  };
}
