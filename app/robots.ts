import type { MetadataRoute } from "next";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://racregistryzw.org";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Allow all crawlers on public pages
        userAgent: "*",
        allow: ["/", "/privacy-notice"],
        disallow: [
          "/admin/",
          "/survey",
          "/edit",
          "/survey/complete",
          "/survey/offline",
          "/retailer-survey",
          "/api/",
          "/_next/",
        ],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
    host: APP_URL,
  };
}
