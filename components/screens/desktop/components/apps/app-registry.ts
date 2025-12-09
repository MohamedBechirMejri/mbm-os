"use client";

import { useEffect, useMemo } from "react";
import { useAppInstallationStore } from "@/lib/app-installation-store";
import { registerApps } from "../window-manager/api";
import { getDesktop } from "../window-manager/store";
import { catalogApps, preinstalledApps, toAppMeta } from "./app-catalog";

// Re-export for backward compatibility
export { catalogApps, preinstalledApps } from "./app-catalog";
export type { CatalogApp } from "./app-catalog";

/**
 * AppRegistry component that registers apps with the window manager.
 * - Preinstalled apps are registered at boot
 * - Installed apps (from App Store) are registered when detected
 */
export function AppRegistry() {
  const installedRecords = useAppInstallationStore(state => state.installed);
  const installedIds = useMemo(
    () => Object.keys(installedRecords),
    [installedRecords]
  );

  // Register preinstalled apps at boot
  useEffect(() => {
    registerApps(preinstalledApps.map(toAppMeta));
  }, []);

  // Register newly installed apps dynamically
  useEffect(() => {
    if (installedIds.length === 0) return;
    const { apps: registered } = getDesktop();
    const metas = catalogApps
      .filter(app => installedIds.includes(app.id) && !registered[app.id])
      .map(toAppMeta);
    if (metas.length > 0) {
      registerApps(metas);
    }
  }, [installedIds]);

  return null;
}
