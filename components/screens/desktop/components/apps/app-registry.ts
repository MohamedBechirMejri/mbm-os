"use client";

import { useEffect } from "react";
import { registerApps } from "../window-manager/api";
import type { AppMeta } from "../window-manager/types";
import { AppStoreApp } from "./app-store";
import { CalculatorApp } from "./calculator";
import { FinderApp } from "./finder";
import { SafariApp } from "./safari";
import { TerminalApp } from "./terminal";

// Full catalog known to the system (used by the App Store to install)
export const catalogApps: AppMeta[] = [
  {
    id: "file-manager",
    title: "Finder",
    icon: "file-manager",
    Component: FinderApp,
    minSize: { w: 520, h: 380 },
    floatingActionBar: false,
    titlebarHeight: 46,
  },
  {
    id: "safari",
    title: "Safari",
    icon: "safari",
    Component: SafariApp,
    minSize: { w: 320, h: 240 },
    floatingActionBar: false,
    titlebarHeight: 46,
  },
  {
    id: "softwarecenter",
    title: "App Store",
    icon: "softwarecenter",
    Component: AppStoreApp,
    minSize: { w: 940, h: 640 },
  },
  // {
  //   id: "calendar",
  //   title: "Calendar",
  //   icon: "calendar",
  //   Component: CalculatorApp,
  //   minSize: { w: 320, h: 240 },
  // },
  {
    id: "game-center",
    title: "Game Center",
    icon: "game-center",
    Component: CalculatorApp,
    minSize: { w: 320, h: 240 },
  },
  {
    id: "terminal",
    title: "Terminal",
    icon: "terminal",
    Component: TerminalApp,
    minSize: { w: 320, h: 240 },
    floatingActionBar: true,
  },

  {
    id: "calculator",
    title: "Calculator",
    icon: "calc",
    Component: CalculatorApp,
    minSize: { w: 200, h: 350 },
    maxSize: { w: 200, h: 350 },
    resizable: false,
    floatingActionBar: true,
  },

  // {
  //   id: "chess",
  //   title: "Chess",
  //   icon: "chess",
  //   Component: CalculatorApp,
  //   minSize: { w: 320, h: 240 },
  // },

  // add more apps here
];

// Minimal set of apps preinstalled at boot (others appear after installing from App Store)
const PREINSTALLED_IDS = new Set<string>(["softwarecenter", "file-manager"]);
export const preinstalledApps = catalogApps.filter((a) =>
  PREINSTALLED_IDS.has(a.id),
);

export function AppRegistry() {
  useEffect(() => {
    // Register only preinstalled apps at boot
    registerApps(preinstalledApps);
  }, []);

  return null;
}
