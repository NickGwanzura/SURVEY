import type { MetadataRoute } from "next";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://racregistryzw.org";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: APP_URL,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1.0,
    },
    {
      url: `${APP_URL}/privacy-notice`,
      lastModified: new Date("2026-05-27"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    // Survey, edit, complete, admin are intentionally excluded —
    // they are transactional/private and should not be indexed.
  ];
}
