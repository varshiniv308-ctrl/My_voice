import type { Metadata, Viewport } from "next";
import { Syne, DM_Mono } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cognitive AI — Executive Intelligence Suite",
  description: "End-to-end executive cognition — from live meeting synthesis to quantum-encrypted archives and autonomous workflows.",
};

export const viewport: Viewport = {
  themeColor: "#07111f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${syne.variable} ${dmMono.variable} bg-background`}>
      <body className="min-h-screen overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
