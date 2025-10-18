"use client";

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useSpring,
  useTransform,
} from "motion/react";
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

  const refractionSpring = useSpring(0, {
    stiffness: 220,
    damping: 30,
    mass: 0.8,
  });
  const [refractionScalar, setRefractionScalar] = useState(0);

  useMotionValueEvent(refractionSpring, "change", (value) => {
    setRefractionScalar(value);
  });

  const glassOpacity = useTransform(refractionSpring, (value) => value);
  const veilOpacity = useTransform(refractionSpring, (value) =>
    Math.max(0, 0.55 - value * 0.55),
  );

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
    refractionSpring.set(open ? 1 : 0);
    if (!open) {
      setQuery("");
      setSelectedId(null);
    }
  }, [open, refractionSpring]);

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
            key="search-overlay"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-[calc(50%-16rem)] top-[18vh] z-[71] w-full px-6"
          >
            <motion.div style={{ opacity: glassOpacity }}>
              <GlassSurface
                width="32rem"
                borderRadius={36}
                height="max-content"
                className={cn(
                  "transition-[background-color,backdrop-filter,box-shadow] duration-300 ease-[0.16,1,0.3,1]",
                )}
                containerClassName="p-0"
                backgroundOpacity={0.34 * Math.min(refractionScalar, 1)}
                refractionIntensity={refractionScalar}
              >
                <div
                  onPointerDown={(event) => event.stopPropagation()}
                  className="relative w-full overflow-hidden rounded-[2.25rem]"
                >
                  <motion.div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-[1] rounded-[inherit] bg-white/25"
                    style={{ opacity: veilOpacity }}
                  />

                  <div className="relative z-10 flex flex-col gap-1">
                    <div className="px-5 pt-5 pb-2">
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
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
