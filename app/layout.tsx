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
  themeColor: "#0A1A0F",
};

export const metadata: Metadata = {
  title: "MacroClawAgent — AI Nutrition for Athletes",
  description:
    "MacroClawAgent syncs your Strava runs and orders the exact fuel you need. AI-powered nutrition planning, automatically delivered.",
  keywords: ["nutrition", "AI", "Strava", "meal planning", "athlete", "fitness"],
  authors: [{ name: "MacroClawAgent" }],
  openGraph: {
    title: "MacroClawAgent — AI Nutrition for Athletes",
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
      className="dark"
      style={{ colorScheme: "dark" }}
      suppressHydrationWarning
    >
      <body
        className={`${inter.variable} ${geistMono.variable} font-sans min-h-screen bg-[#0A1A0F] text-green-50 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
