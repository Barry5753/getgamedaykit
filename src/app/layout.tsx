import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import {
  Barlow_Condensed,
  IBM_Plex_Mono,
  IBM_Plex_Sans,
} from "next/font/google";

import "./globals.css";

const siteUrl = new URL("https://getgamedaykit.com");
const siteTitle =
  "GameDayKit | World Cup 2026 poster and caption generator";
const siteDescription =
  "Create World Cup 2026 matchday posters and social captions for bars, pubs, restaurants, and venues.";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  applicationName: "GameDayKit",
  title: {
    default: siteTitle,
    template: "%s | GameDayKit",
  },
  description: siteDescription,
  keywords: [
    "World Cup 2026 poster generator",
    "matchday poster generator",
    "sports bar promotion",
    "football social caption generator",
    "venue marketing tool",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: "/",
    siteName: "GameDayKit",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "GameDayKit matchday poster and caption generator preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/opengraph-image"],
  },
  icons: {
    icon: "/icon.svg",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0b0e14",
};

const bodyFont = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-family-body",
  display: "swap",
});

const displayFont = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-family-display",
  display: "swap",
});

const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-family-mono",
  display: "swap",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${bodyFont.variable} ${displayFont.variable} ${monoFont.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
