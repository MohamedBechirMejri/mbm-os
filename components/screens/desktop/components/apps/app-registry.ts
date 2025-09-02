"use client";

import { useEffect } from "react";
import { registerApps } from "../window-manager/api";
import type { AppMeta } from "../window-manager/types";
import { CalculatorApp } from "./calculator";

const icons = [
  "file-manager",
  "safari",
  "softwarecenter",
  "calendar",
  "calc",
  "terminal",
  "google-chrome",
  "spotify-client",
  "badland",
  "chess",
  "doom-2016",
  "mindustry",
  "rimworld",
];

export const apps: AppMeta[] = [
  {
    id: "calculator",
    title: "Calculator",
    icon: 'calc',
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
