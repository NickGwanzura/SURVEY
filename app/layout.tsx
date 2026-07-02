import type { Metadata, Viewport } from "next";

import "./globals.css";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://racregistryzw.org";

const SITE_NAME = "ZW RAC Technician Registry";
const DEFAULT_TITLE = "Zimbabwe RAC Technician Registry";
const DEFAULT_DESCRIPTION =
  "Official self-registration portal for HVAC-R technicians in Zimbabwe. Register with the National Ozone Unit (NOU) and HEVACRAZ to join the National RAC Technician Registry.";
const OG_IMAGE = `${APP_URL}/og-image.png`;

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),

  title: {
    default: DEFAULT_TITLE,
    template: `%s · ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,

  // ── Canonical & robots ──────────────────────────────────────────
  alternates: {
    canonical: APP_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ── Open Graph (Facebook, WhatsApp, LinkedIn) ───────────────────
  openGraph: {
    type: "website",
    url: APP_URL,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    siteName: SITE_NAME,
    locale: "en_ZW",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Zimbabwe RAC Technician Registry — National HVAC-R Self-Registration Portal",
        type: "image/png",
      },
    ],
  },

  // ── Twitter / X Card ────────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [{ url: OG_IMAGE, alt: "Zimbabwe RAC Technician Registry" }],
  },

  // ── Icons ───────────────────────────────────────────────────────
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },

  // ── PWA ─────────────────────────────────────────────────────────
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RAC Registry",
  },
  formatDetection: {
    telephone: false,
  },

  // ── Verification placeholders (add values from Search Console) ──
  // verification: {
  //   google: "YOUR_GOOGLE_SEARCH_CONSOLE_TOKEN",
  // },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0d4f3c" },
    { media: "(prefers-color-scheme: dark)", color: "#022c22" },
  ],
};

/** JSON-LD structured data — WebSite + GovernmentOrganization */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${APP_URL}/#website`,
      url: APP_URL,
      name: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      inLanguage: "en",
      publisher: { "@id": `${APP_URL}/#organization` },
    },
    {
      "@type": "GovernmentOrganization",
      "@id": `${APP_URL}/#organization`,
      name: "National Ozone Unit of Zimbabwe",
      alternateName: ["NOU Zimbabwe", "NOU & HEVACRAZ"],
      url: APP_URL,
      logo: {
        "@type": "ImageObject",
        url: `${APP_URL}/logo.jpeg`,
        width: 400,
        height: 400,
      },
      sameAs: [
        "https://www.environment.gov.zw",
      ],
      address: {
        "@type": "PostalAddress",
        streetAddress: "11th Floor, Kaguvi Building, Cnr S. Machel Avenue / Central Avenue",
        addressLocality: "Harare",
        addressCountry: "ZW",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="dns-prefetch" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap"
          crossOrigin="anonymous"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="default"
        />
        <link rel="manifest" href="/manifest.webmanifest" />
        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
