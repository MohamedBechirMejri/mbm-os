"use client";

import { useEffect, useMemo } from "react";
import { useAppInstallationStore } from "@/lib/app-installation-store";
import { registerApps } from "../window-manager/api";
import { getDesktop } from "../window-manager/store";
import type { AppMeta } from "../window-manager/types";
import { AppStoreApp } from "./app-store";
import { CalculatorApp } from "./calculator";
import { FinderApp } from "./finder";
import { MillionRowGrid } from "./million-row-grid";
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
    floatingActionBar: true,
    titlebarHeight: 46,
    actionButtonsStyle: {
      top: 22,
      left: 22,
      position: "absolute",
    },
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
    floatingActionBar: true,
    actionButtonsStyle: {
      top: 22,
      left: 16,
      position: "absolute",
    },
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

  {
    id: "million-row-grid",
    title: "Million Row Grid",
    icon: "libreoffice-calc",
    Component: MillionRowGrid,
    minSize: { w: 600, h: 400 },
    floatingActionBar: true,
  },

  // add more apps here
];

// Minimal set of apps preinstalled at boot (others appear after installing from App Store)
const PREINSTALLED_IDS = new Set<string>([
  "softwarecenter",
  "safari",
  "file-manager",
  "game-center",
  "terminal",
]);
export const preinstalledApps = catalogApps.filter((a) =>
  PREINSTALLED_IDS.has(a.id),
);

export function AppRegistry() {
  const installedRecords = useAppInstallationStore((state) => state.installed);
  const installedIds = useMemo(
    () => Object.keys(installedRecords),
    [installedRecords],
  );

  useEffect(() => {
    // Register only preinstalled apps at boot
    registerApps(preinstalledApps);
  }, []);

  useEffect(() => {
    if (installedIds.length === 0) return;
    const { apps: registered } = getDesktop();
    const metas = catalogApps.filter(
      (app) => installedIds.includes(app.id) && !registered[app.id],
    );
    if (metas.length > 0) {
      registerApps(metas);
    }
  }, [installedIds]);

  return null;
}
