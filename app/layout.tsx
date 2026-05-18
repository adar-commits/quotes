import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { resolveMetadataBaseUrl } from "@/lib/app-url";
import LineLoader from "./LineLoader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: resolveMetadataBaseUrl(),
  title: { default: "הצעות מחיר", template: "%s" },
  description: "צפייה, אישור והערכה של הצעות מחיר",
  icons: {
    // Raster first: WhatsApp / FB crawlers often ignore SVG and fall back to a generic host icon.
    icon: [
      { url: "/hom-icon.jpg", sizes: "192x192", type: "image/jpeg" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/hom-icon.jpg", sizes: "192x192", type: "image/jpeg" }],
  },
  openGraph: {
    type: "website",
    locale: "he_IL",
    siteName: "הצעות מחיר",
    title: "הצעות מחיר",
    description: "צפייה, אישור והערכה של הצעות מחיר",
    images: [{ url: "/hom-icon.jpg", width: 192, height: 192, alt: "קבוצת HoM" }],
  },
};

const THEME_RED = "#801a1e";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: THEME_RED,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LineLoader />
        {children}
      </body>
    </html>
  );
}
