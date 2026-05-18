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
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    type: "website",
    locale: "he_IL",
    siteName: "הצעות מחיר",
    title: "הצעות מחיר",
    description: "צפייה, אישור והערכה של הצעות מחיר",
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
