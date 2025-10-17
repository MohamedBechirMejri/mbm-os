import type {
  AppId,
  AppMeta,
  WinInstance,
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
