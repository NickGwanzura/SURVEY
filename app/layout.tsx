import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zimbabwe RAC Technician Registry",
  description:
    "Self-registration survey for HVAC-R technicians operating in Zimbabwe — National Ozone Unit and HEVACRAZ.",
  applicationName: "ZW RAC Technician Registry",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0d4f3c",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
