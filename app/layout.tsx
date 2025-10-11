import type { Metadata } from "next";
import { Figtree, Inter } from "next/font/google";
import "./globals.css";
import { MotionConfig } from "motion/react";
import LiquidGlassFilters from "@/components/screens/login/components/liquid-glass-filters";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const figtree = Figtree({
  preload: true,
  weight: "variable",
  variable: "--font-figtree",
});

export const metadata: Metadata = {
  title: "MBMOS",
  description:
    "A macOS-inspired desktop environment in your browser. a collection of web apps and experiences. created by Mohamed Bechir Mejri",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${figtree.variable} antialiased`}>
        <MotionConfig reducedMotion="never">{children}</MotionConfig>

        {/* SVG Filters */}
        <LiquidGlassFilters />
      </body>
    </html>
  );
}
