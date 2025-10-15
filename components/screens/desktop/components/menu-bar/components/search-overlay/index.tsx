"use client";

import { Search, Square } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useMemo, useState } from "react";

import {
  type AppId,
  type AppMeta,
  DesktopAPI,
  type WinInstance,
} from "@/components/screens/desktop/components/window-manager";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchOverlayProps = {
  open: boolean;
  apps: AppMeta[];
  windows: WinInstance[];
  onClose: () => void;
};

type SearchEntry = {
  id: string;
  label: string;
  description?: string;
  kind: "app" | "window";
  appId?: AppId;
  windowId?: string;
};

function normalize(value: string) {
  return value
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function fuzzyIncludes(source: string, query: string) {
  if (!query) return true;
  const haystack = normalize(source);
  const needle = normalize(query);
  return haystack.includes(needle);
}

function AppGlyph({ app }: { app: AppMeta }) {
  if (typeof app.icon === "string" && app.icon.length > 0) {
    return (
      <Image
        src={`/assets/icons/apps/${app.icon}.ico`}
        alt={app.title}
        width={28}
        height={28}
        className="rounded-xl"
      />
    );
  }

  if (app.icon) {
    return <span className="text-white/75">{app.icon}</span>;
  }

  return (
    <span className="flex size-7 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white/70">
      <Square className="size-4" />
    </span>
  );
}

function buildEntries(apps: AppMeta[], windows: WinInstance[]): SearchEntry[] {
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

export function SearchOverlay({
  open,
  apps,
  windows,
  onClose,
}: SearchOverlayProps) {
  const [query, setQuery] = useState("");

  const appsById = useMemo(() => {
    return new Map<AppId, AppMeta>(apps.map((app) => [app.id, app]));
  }, [apps]);

  const entries = useMemo(() => buildEntries(apps, windows), [apps, windows]);

  const filtered = useMemo(() => {
    if (!query.trim()) {
      return entries.slice(0, 9);
    }

    return entries
      .filter((entry) => {
        const meta = entry.appId ? appsById.get(entry.appId) : null;
        const candidate = [
          entry.label,
          entry.description ?? "",
          entry.appId ?? "",
          meta?.title ?? "",
        ].join(" ");
        return fuzzyIncludes(candidate, query);
      })
      .slice(0, 9);
  }, [appsById, entries, query]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const first = filtered[0];
    if (first) {
      handleSelect(first);
    }
  };

  const handleSelect = (entry: SearchEntry) => {
    if (entry.kind === "app" && entry.appId) {
      launchOrFocusApp(entry.appId);
    }

    if (entry.kind === "window" && entry.windowId) {
      focusWindow(entry.windowId);
    }

    onClose();
  };

  const launchOrFocusApp = (appId: AppId) => {
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
  };

  const focusWindow = (windowId: string) => {
    const state = DesktopAPI.getState();
    const win = state.windows[windowId];
    if (!win) return;
    if (win.state === "minimized") {
      DesktopAPI.setState(win.id, "normal");
    }
    DesktopAPI.focus(win.id);
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="search-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[70] flex items-start justify-center bg-slate-950/55 px-6 pt-24 backdrop-blur-[28px]"
          onPointerDown={onClose}
        >
          <motion.div
            initial={{ y: -24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -24, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.34, 1.56, 0.64, 1] }}
            className="w-full max-w-2xl"
            onPointerDown={(event) => event.stopPropagation()}
          >
            <section
              className={cn(
                "relative rounded-3xl border border-white/14 bg-[linear-gradient(135deg,rgba(255,255,255,0.28)_0%,rgba(255,255,255,0.1)_40%,rgba(90,120,255,0.12)_100%)] p-6 text-white shadow-[0_1.5rem_4rem_rgba(8,15,40,0.55)]",
                "backdrop-blur-[32px]",
              )}
            >
              <div className="pointer-events-none absolute inset-0 rounded-[inherit] border border-white/12" />
              <div className="pointer-events-none absolute -top-24 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-white/20 blur-3xl" />
              <div className="relative z-10">
                <form onSubmit={handleSubmit}>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/60" />
                    <Input
                      autoFocus
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search apps or windows"
                      className="h-12 rounded-2xl border-white/20 bg-white/12 pl-10 text-base text-white placeholder:text-white/50"
                      aria-label="Search applications"
                      onKeyDown={(event) => {
                        if (event.key === "Escape") {
                          event.stopPropagation();
                          onClose();
                        }
                      }}
                    />
                  </div>
                </form>

                <div className="mt-5 space-y-4">
                  {filtered.length === 0 ? (
                    <p className="rounded-2xl border border-white/10 bg-white/8 px-4 py-6 text-center text-sm text-white/70">
                      Nothing matches that query yet. Maybe try fewer syllables?
                    </p>
                  ) : null}

                  {filtered.length > 0 ? (
                    <ul className="space-y-2">
                      {filtered.map((entry) => {
                        const appMeta = entry.appId
                          ? appsById.get(entry.appId)
                          : null;
                        return (
                          <li key={entry.id}>
                            <button
                              type="button"
                              onClick={() => handleSelect(entry)}
                              className="flex w-full items-center gap-3 rounded-2xl border border-white/12 bg-white/10 px-4 py-3 text-left text-sm text-white/80 transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-white/18 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                            >
                              <span className="flex size-9 items-center justify-center rounded-2xl border border-white/20 bg-white/12">
                                {appMeta ? (
                                  <AppGlyph app={appMeta} />
                                ) : (
                                  <Square className="size-4 text-white/60" />
                                )}
                              </span>
                              <span className="flex flex-1 flex-col">
                                <span className="text-sm font-semibold leading-tight">
                                  {entry.label}
                                </span>
                                {entry.description ? (
                                  <span className="text-xs text-white/60">
                                    {entry.description}
                                  </span>
                                ) : null}
                              </span>
                              <span className="text-xs uppercase tracking-wide text-white/50">
                                {entry.kind === "app" ? "App" : "Window"}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </div>
              </div>
            </section>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
