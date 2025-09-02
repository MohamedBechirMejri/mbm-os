"use client";

import { useEffect } from "react";
import { registerApps } from "../window-manager/api";
import type { AppMeta } from "../window-manager/types";
import { CalculatorApp } from "./calculator";

export const apps: AppMeta[] = [
  {
    id: "file-manager",
    title: "Finder",
    icon: "file-manager",
    Component: CalculatorApp,
    minSize: { w: 320, h: 240 },
  },
  {
    id: "safari",
    title: "Safari",
    icon: "safari",
    Component: CalculatorApp,
    minSize: { w: 320, h: 240 },
  },
  {
    id: "softwarecenter",
    title: "App Store",
    icon: "softwarecenter",
    Component: CalculatorApp,
    minSize: { w: 320, h: 240 },
  },
  {
    id: "calendar",
    title: "Calendar",
    icon: "calendar",
    Component: CalculatorApp,
    minSize: { w: 320, h: 240 },
  },
  {
    id: "calculator",
    title: "Calculator",
    icon: "calc",
    Component: CalculatorApp,
    minSize: { w: 320, h: 240 },
  },
  {
    id: "terminal",
    title: "Terminal",
    icon: "terminal",
    Component: CalculatorApp,
    minSize: { w: 320, h: 240 },
  },
  {
    id: "google-chrome",
    title: "Google Chrome",
    icon: "google-chrome",
    Component: CalculatorApp,
    minSize: { w: 320, h: 240 },
  },
  {
    id: "spotify",
    title: "Spotify",
    icon: "spotify-client",
    Component: CalculatorApp,
    minSize: { w: 320, h: 240 },
  },
  {
    id: "badland",
    title: "Badland",
    icon: "badland",
    Component: CalculatorApp,
    minSize: { w: 320, h: 240 },
  },
  {
    id: "chess",
    title: "Chess",
    icon: "chess",
    Component: CalculatorApp,
    minSize: { w: 320, h: 240 },
  },
  {
    id: "doom-2016",
    title: "Doom",
    icon: "doom-2016",
    Component: CalculatorApp,
    minSize: { w: 320, h: 240 },
  },
  {
    id: "mindustry",
    title: "Mindustry",
    icon: "mindustry",
    Component: CalculatorApp,
    minSize: { w: 320, h: 240 },
  },
  {
    id: "rimworld",
    title: "RimWorld",
    icon: "rimworld",
    Component: CalculatorApp,
    minSize: { w: 320, h: 240 },
  },
  // add more apps here
];

export function AppRegistry() {
  useEffect(() => {
    registerApps(apps);
  }, []);

  return null;
}
