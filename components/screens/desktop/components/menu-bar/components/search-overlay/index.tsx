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

const overlayVariants = {
  hidden: { y: -8, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

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

          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={overlayVariants}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed left-[calc(50%-16rem)] top-[18vh] z-[71] w-full px-6"
          >
            <GlassSurface
              width="32rem"
              borderRadius={36}
              height="max-content"
              className={cn("!backdrop-blur-[8px]")}
              containerClassName="p-0"
              backgroundOpacity={0.15}
              refractionIntensity={1.2}
              blur={1}
              borderWidth={0.01}
            >
              <div
                onPointerDown={(event) => event.stopPropagation()}
                className="relative w-full overflow-hidden rounded-[2.25rem]"
              >
                <div className="relative z-10 flex flex-col">
                  <div className="">
                    <SearchInput
                      query={query}
                      onQueryChange={(newQuery) => {
                        setQuery(newQuery);
                        setSelectedId(null);
                      }}
                      onSubmit={handleSubmit}
                      onKeyDown={handleKeyDown}
                    />
                  </div>

                  <SearchResults
                    visible={showResultsPanel}
                    filtered={filtered}
                    activeId={activeId}
                    appsById={appsById}
                    onSelect={handleSelect}
                    onHover={setSelectedId}
                  />
                </div>
              </div>
            </GlassSurface>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
