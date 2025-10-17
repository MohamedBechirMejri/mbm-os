"use client";

import { Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";

import {
  type AppId,
  type AppMeta,
  DesktopAPI,
  type WinInstance,
} from "@/components/screens/desktop/components/window-manager";
import GlassSurface from "@/components/ui/glass-surface";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SearchResultItem } from "./search-result-item";
import type { SearchEntry } from "./types";
import { buildEntries, fuzzyIncludes, RESULTS_LIMIT } from "./utils";

type SearchOverlayProps = {
  open: boolean;
  apps: AppMeta[];
  windows: WinInstance[];
  onClose: () => void;
};

export function SearchOverlay({
  open,
  apps,
  windows,
  onClose,
}: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const appsById = useMemo(() => {
    return new Map<AppId, AppMeta>(apps.map((app) => [app.id, app]));
  }, [apps]);

  const entries = useMemo(() => buildEntries(apps, windows), [apps, windows]);

  const trimmedQuery = query.trim();
  const showResultsPanel = trimmedQuery.length > 0;

  const filtered = useMemo(() => {
    if (!showResultsPanel) {
      return [];
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
        return fuzzyIncludes(candidate, trimmedQuery);
      })
      .slice(0, RESULTS_LIMIT);
  }, [appsById, entries, trimmedQuery, showResultsPanel]);

  const activeId = useMemo(() => {
    if (!showResultsPanel || filtered.length === 0) {
      return null;
    }

    if (selectedId && filtered.some((entry) => entry.id === selectedId)) {
      return selectedId;
    }

    return filtered[0].id;
  }, [filtered, selectedId, showResultsPanel]);

  const selectedIndex = activeId
    ? filtered.findIndex((entry) => entry.id === activeId)
    : -1;

  const activeEntry = selectedIndex >= 0 ? filtered[selectedIndex] : null;

  useEffect(() => {
    if (!open) {
      setQuery("");
      setSelectedId(null);
    }
  }, [open]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (activeEntry) {
      handleSelect(activeEntry);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      if (!showResultsPanel || filtered.length === 0) {
        return;
      }

      event.preventDefault();
      const nextIndex =
        selectedIndex === -1
          ? 0
          : Math.min(selectedIndex + 1, filtered.length - 1);
      setSelectedId(filtered[nextIndex].id);
    } else if (event.key === "ArrowUp") {
      if (!showResultsPanel || filtered.length === 0) {
        return;
      }

      event.preventDefault();
      const nextIndex =
        selectedIndex === -1
          ? filtered.length - 1
          : Math.max(selectedIndex - 1, 0);
      setSelectedId(filtered[nextIndex].id);
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      setQuery("");
      setSelectedId(null);
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

    setQuery("");
    setSelectedId(null);
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
          <motion.div
            key="search-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[70]"
            onPointerDown={() => {
              setQuery("");
              setSelectedId(null);
              onClose();
            }}
          />

          <div className="fixed left-1/2 top-[5vh] z-[71] w-full max-w-[40rem] -translate-x-1/2 px-6">
            <GlassSurface width={"24rem"} height={"max-content"}>
              <motion.div
                key="search-box"
                layout
                initial={{ y: -18, opacity: 0, scale: 0.96 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -14, opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
                onPointerDown={(event) => event.stopPropagation()}
                onKeyDown={handleKeyDown}
                className={cn("relative overflow-visible")}
              >
                <form onSubmit={handleSubmit} className="relative">
                  <motion.div
                    layout
                    className="relative flex items-center gap-3 px-4 py-2.5 bg-white/20 backdrop-blur-[64px] rounded-full"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center">
                      <Search className="size-[1.25rem] text-slate-400" />
                    </div>
                    <Input
                      autoFocus
                      value={query}
                      onChange={(event) => {
                        setQuery(event.target.value);
                        setSelectedId(null);
                      }}
                      placeholder="Spotlight Search"
                      className="min-w-0 flex-1 border-0 bg-transparent px-0 text-[1.125rem] font-normal text-slate-900 placeholder:text-slate-400 focus-visible:border-0 focus-visible:ring-0"
                      aria-label="Spotlight Search"
                    />
                  </motion.div>
                </form>

                <AnimatePresence initial={false}>
                  {showResultsPanel ? (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -12 }}
                      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                      className="relative border-t border-white/25 bg-white/30 px-3 pb-3 pt-2 backdrop-blur-[64px]"
                    >
                      {filtered.length > 0 ? (
                        <div className="max-h-[26rem] space-y-1.5 overflow-y-auto pr-1.5">
                          {filtered.map((entry) => {
                            const appMeta = entry.appId
                              ? appsById.get(entry.appId)
                              : null;
                            const isSelected = entry.id === activeId;

                            return (
                              <SearchResultItem
                                key={entry.id}
                                entry={entry}
                                isSelected={isSelected}
                                appMeta={appMeta ?? null}
                                onSelect={handleSelect}
                                onHover={setSelectedId}
                              />
                            );
                          })}
                        </div>
                      ) : (
                        <div className="px-4 py-6 text-center text-[0.875rem] font-medium text-slate-500">
                          No results
                        </div>
                      )}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.div>
            </GlassSurface>
          </div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
