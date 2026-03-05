import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0066EE",
};

export const metadata: Metadata = {
  title: "Jonno — AI Nutrition for Athletes",
  description:
    "Jonno syncs your Strava runs and orders the exact fuel you need. AI-powered nutrition planning, automatically delivered.",
  keywords: ["nutrition", "AI", "Strava", "meal planning", "athlete", "fitness"],
  authors: [{ name: "Jonno" }],
  openGraph: {
    title: "Jonno — AI Nutrition for Athletes",
    description: "Your AI nutrition coach, built for athletes.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body
        className={`${inter.variable} ${geistMono.variable} font-sans min-h-screen bg-white text-gray-900 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
