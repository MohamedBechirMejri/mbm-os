import {
  type AppId,
  type AppMeta,
  DesktopAPI,
  type WinInstance,
} from "@/components/screens/desktop/components/window-manager";
import type { SearchEntry } from "./types";

export const RESULTS_LIMIT = 8;

export function normalize(value: string) {
  return value
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export function fuzzyIncludes(source: string, query: string) {
  if (!query) return true;
  const haystack = normalize(source);
  const needle = normalize(query);
  return haystack.includes(needle);
}

export function buildEntries(
  apps: AppMeta[],
  windows: WinInstance[],
): SearchEntry[] {
  const appMap = new Map<AppId, AppMeta>(apps.map((app) => [app.id, app]));

  const appEntries = apps.map((app) => ({
    id: `app:${app.id}`,
    label: app.title,
    description: "Launch installed experience",
    kind: "app" as const,
    appId: app.id,
  }));

  const windowEntries = [...windows]
    .sort((a, b) => b.z - a.z)
    .map((win) => {
      const relatedApp = appMap.get(win.appId);
      const label = win.title || relatedApp?.title || win.appId;
      return {
        id: `window:${win.id}`,
        label,
        description: relatedApp
          ? `Switch to ${relatedApp.title}`
          : "Switch to running window",
        kind: "window" as const,
        windowId: win.id,
        appId: win.appId,
      };
    });

  return [...windowEntries, ...appEntries];
}

export function launchOrFocusApp(appId: AppId) {
  const state = DesktopAPI.getState();
  const existing = Object.values(state.windows).find(
    (win) => win.appId === appId,
  );

  if (existing) {
    if (existing.state === "minimized") {
      DesktopAPI.setState(existing.id, "normal");
    }
    DesktopAPI.focus(existing.id);
    return;
  }

  DesktopAPI.launch(appId);
}

export function focusWindow(windowId: string) {
  const state = DesktopAPI.getState();
  const win = state.windows[windowId];
  if (!win) return;
  if (win.state === "minimized") {
    DesktopAPI.setState(win.id, "normal");
  }
  DesktopAPI.focus(win.id);
}
