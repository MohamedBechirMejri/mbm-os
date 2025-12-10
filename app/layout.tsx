import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import { MotionConfig } from "motion/react";
import { ReactQueryProvider } from "@/components/react-query-provider";
import { Analytics } from "@vercel/analytics/next";

// import LiquidGlassFilters from "@/components/screens/login/components/liquid-glass-filters";

const figtree = Figtree({
  preload: true,
  weight: "variable",
  variable: "--font-figtree",
});

export const metadata: Metadata = {
  title: "mbmOS",
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
      <head>
        <script src="https://unpkg.com/react-scan/dist/auto.global.js" />
      </head>
      <body
        className={`${figtree.variable} antialiased font-[Figtree] overflow-hidden overscroll-none`}
      >
        <MotionConfig reducedMotion="never">
          <ReactQueryProvider>{children}</ReactQueryProvider>
        </MotionConfig>

        {/* SVG Filters */}
        {/* <LiquidGlassFilters /> */}
        <Analytics />
      </body>
    </html>
  );
}
