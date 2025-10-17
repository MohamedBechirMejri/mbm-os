"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";

import type {
  AppId,
  AppMeta,
  WinInstance,
} from "@/components/screens/desktop/components/window-manager";
import GlassSurface from "@/components/ui/glass-surface";
import { cn } from "@/lib/utils";
import { SearchBackdrop, SearchInput, SearchResults } from "./components";
import type { SearchEntry } from "./types";
import {
  buildEntries,
  focusWindow,
  fuzzyIncludes,
  launchOrFocusApp,
  RESULTS_LIMIT,
} from "./utils";

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

  const handleClose = () => {
    setQuery("");
    setSelectedId(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {open ? (
        <>
          <SearchBackdrop onClose={handleClose} />

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
                className={cn("relative overflow-visible")}
              >
                <SearchInput
                  query={query}
                  onQueryChange={(newQuery) => {
                    setQuery(newQuery);
                    setSelectedId(null);
                  }}
                  onSubmit={handleSubmit}
                  onKeyDown={handleKeyDown}
                />

                <SearchResults
                  visible={showResultsPanel}
                  filtered={filtered}
                  activeId={activeId}
                  appsById={appsById}
                  onSelect={handleSelect}
                  onHover={setSelectedId}
                />
              </motion.div>
            </GlassSurface>
          </div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
