"use client";

import { Search, Square } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

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
        width={32}
        height={32}
        className="rounded-lg"
      />
    );
  }

  if (app.icon) {
    return <span className="text-xl">{app.icon}</span>;
  }

  return (
    <div className="flex size-8 items-center justify-center rounded-lg bg-black/10">
      <Square className="size-4 text-black/60" />
    </div>
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
  const [selectedIndex, setSelectedIndex] = useState(0);

  const appsById = useMemo(() => {
    return new Map<AppId, AppMeta>(apps.map((app) => [app.id, app]));
  }, [apps]);

  const entries = useMemo(() => buildEntries(apps, windows), [apps, windows]);

  const filtered = useMemo(() => {
    if (!query.trim()) {
      return entries.slice(0, 8);
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
      .slice(0, 8);
  }, [appsById, entries, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [filtered]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const selected = filtered[selectedIndex];
    if (selected) {
      handleSelect(selected);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onClose();
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
        <>
          {/* Invisible backdrop for click-outside */}
          <motion.div
            key="search-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[70]"
            onPointerDown={onClose}
          />

          {/* Spotlight search box */}
          <div className="fixed left-1/2 top-[15vh] z-[71] w-full max-w-[36rem] -translate-x-1/2 px-6">
            <motion.div
              key="search-box"
              initial={{ y: -20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -10, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              onPointerDown={(event) => event.stopPropagation()}
              onKeyDown={handleKeyDown}
              className={cn(
                "relative overflow-hidden rounded-[1.125rem] border border-white/[0.12]",
                "bg-white/[0.8] text-black shadow-[0_1rem_3rem_rgba(0,0,0,0.2)]",
                "backdrop-blur-[72px] backdrop-saturate-[180%]",
              )}
            >
              {/* Search input */}
              <form onSubmit={handleSubmit} className="relative">
                <div className="relative flex items-center px-4">
                  <Search className="pointer-events-none size-[1.125rem] text-black/40" />
                  <Input
                    autoFocus
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Spotlight Search"
                    className="h-14 border-0 bg-transparent pl-3 pr-4 text-[1.0625rem] text-black placeholder:text-black/40 focus-visible:ring-0"
                    aria-label="Spotlight Search"
                  />
                </div>
              </form>

              {/* Results */}
              {filtered.length === 0 && query.trim() ? (
                <div className="border-t border-black/[0.06] px-5 py-6 text-center">
                  <p className="text-[0.8125rem] text-black/50">No results</p>
                </div>
              ) : null}

              {filtered.length > 0 ? (
                <div className="max-h-[32rem] overflow-y-auto border-t border-black/[0.06] px-1.5 py-1.5">
                  {filtered.map((entry, index) => {
                    const appMeta = entry.appId
                      ? appsById.get(entry.appId)
                      : null;
                    const isSelected = index === selectedIndex;

                    return (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => handleSelect(entry)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-[0.5rem] px-2.5 py-2 text-left transition-colors",
                          isSelected
                            ? "bg-blue-500 text-white"
                            : "text-black hover:bg-black/[0.05]",
                        )}
                      >
                        <div className="flex size-10 shrink-0 items-center justify-center">
                          {appMeta ? (
                            <AppGlyph app={appMeta} />
                          ) : (
                            <div className="flex size-8 items-center justify-center rounded-lg bg-black/10">
                              <Square className="size-4 text-black/60" />
                            </div>
                          )}
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span className="truncate text-[0.875rem] font-medium leading-tight">
                            {entry.label}
                          </span>
                          {entry.description ? (
                            <span
                              className={cn(
                                "truncate text-[0.6875rem] leading-tight",
                                isSelected ? "text-white/70" : "text-black/50",
                              )}
                            >
                              {entry.description}
                            </span>
                          ) : null}
                        </div>
                        <span
                          className={cn(
                            "shrink-0 text-[0.625rem] font-medium uppercase tracking-wide",
                            isSelected ? "text-white/50" : "text-black/35",
                          )}
                        >
                          {entry.kind === "app" ? "App" : "Win"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </motion.div>
          </div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
