import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MotionConfig } from "motion/react";
import LiquidGlassFilters from "@/components/screens/login/components/liquid-glass-filters";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mohamed Bechir Mejri",
  description: "Personal website of Mohamed Bechir Mejri --Software Engineer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <MotionConfig reducedMotion="never">{children}</MotionConfig>

        {/* SVG Filters */}
        <LiquidGlassFilters />
      </body>
    </html>
  );
}
