"use client";

import { useDesktop } from "../../window-manager";

export function useActiveApp() {
  const activeId = useDesktop((s) => s.activeId);
  const windows = useDesktop((s) => s.windows);
  const apps = useDesktop((s) => s.apps);

  if (!activeId || !windows[activeId]) {
    return { appId: null, appTitle: "Finder", appMeta: null };
  }

  const window = windows[activeId];
  const appMeta = apps[window.appId];

  return {
    appId: window.appId,
    appTitle: appMeta?.title || window.appId,
    appMeta,
  };
}
