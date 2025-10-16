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

const QUICK_ACTION_IDS: AppId[] = [
  "softwarecenter",
  "file-manager",
  "safari",
  "terminal",
];

const RESULTS_LIMIT = 8;

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

function AppGlyph({
  app,
  className,
  size = 32,
  variant = "default",
}: {
  app: AppMeta;
  className?: string;
  size?: number;
  variant?: "default" | "plain";
}) {
  if (typeof app.icon === "string" && app.icon.length > 0) {
    return (
      <Image
        src={`/assets/icons/apps/${app.icon}.ico`}
        alt={app.title}
        width={size}
        height={size}
        className={cn(
          "object-cover",
          variant === "plain" ? "rounded-[1.75rem]" : "rounded-[0.75rem]",
          className,
        )}
      />
    );
  }

  if (app.icon) {
    return (
      <span
        className={cn("text-[1.125rem] leading-none text-current", className)}
      >
        {app.icon}
      </span>
    );
  }

  const dimensionRem = `${size / 16}rem`;

  return (
    <div
      style={{ width: dimensionRem, height: dimensionRem }}
      className={cn(
        "flex items-center justify-center rounded-[0.75rem] bg-black/10",
        variant === "plain" && "bg-transparent",
        className,
      )}
    >
      <Square className="h-[1rem] w-[1rem] text-black/60" />
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
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const appsById = useMemo(() => {
    return new Map<AppId, AppMeta>(apps.map((app) => [app.id, app]));
  }, [apps]);

  const quickActions = useMemo(() => {
    return QUICK_ACTION_IDS.map((id) => appsById.get(id)).filter(
      (candidate): candidate is AppMeta => Boolean(candidate),
    );
  }, [appsById]);

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

  const handleQuickAction = (appId: AppId) => {
    launchOrFocusApp(appId);
    setQuery("");
    setSelectedId(null);
    onClose();
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
            className="fixed inset-0 z-[70] bg-gradient-to-br from-slate-900/10 via-slate-900/5 to-slate-900/20 backdrop-blur-[6px]"
            onPointerDown={() => {
              setQuery("");
              setSelectedId(null);
              onClose();
            }}
          />

          <div className="fixed left-1/2 top-[15vh] z-[71] w-full max-w-[40rem] -translate-x-1/2 px-6">
            <motion.div
              key="search-box"
              layout
              initial={{ y: -18, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -14, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
              onPointerDown={(event) => event.stopPropagation()}
              onKeyDown={handleKeyDown}
              className={cn(
                "relative overflow-hidden rounded-[2.875rem] border border-white/30",
                "bg-white/60 text-slate-900 shadow-[0_1.5rem_4.5rem_rgba(15,23,42,0.16)]",
                "backdrop-blur-[64px] backdrop-saturate-[185%]",
                "focus-within:shadow-[0_1.75rem_5rem_rgba(36,99,235,0.26)]",
              )}
            >
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-[0.15rem] rounded-[2.75rem] border border-white/45" />
                <div className="absolute inset-0 rounded-[2.875rem] bg-gradient-to-br from-white/70 via-white/35 to-white/25 opacity-80" />
                <div className="absolute -right-1/3 -top-[40%] h-[12rem] w-[12rem] rounded-full bg-sky-200/45 blur-3xl" />
              </div>

              <form onSubmit={handleSubmit} className="relative">
                <motion.div
                  layout
                  className="relative flex items-center gap-4 px-6 py-4 md:px-7"
                >
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-white/50 bg-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                    <Search className="size-[1.15rem] text-slate-500" />
                  </div>
                  <Input
                    autoFocus
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setSelectedId(null);
                    }}
                    placeholder="Spotlight Search"
                    className="h-[3.25rem] border-0 bg-transparent px-0 text-[1.125rem] font-medium text-slate-900 placeholder:text-slate-500 focus-visible:border-0 focus-visible:ring-0"
                    aria-label="Spotlight Search"
                  />

                  {quickActions.length > 0 ? (
                    <div className="ml-auto flex items-center gap-2">
                      {quickActions.map((appMeta) => (
                        <motion.button
                          key={appMeta.id}
                          type="button"
                          onClick={() => handleQuickAction(appMeta.id)}
                          whileHover={{ y: -2, scale: 1.02 }}
                          whileTap={{ scale: 0.96 }}
                          className="group relative flex size-12 items-center justify-center rounded-full border border-white/45 bg-gradient-to-br from-white/90 via-white/60 to-white/35 shadow-[0_0.75rem_2.5rem_rgba(15,23,42,0.18),inset_0_1px_0_rgba(255,255,255,0.85)] transition-shadow duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80"
                        >
                          <span className="pointer-events-none absolute inset-[0.18rem] rounded-full bg-white/35 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100" />
                          <AppGlyph
                            app={appMeta}
                            size={28}
                            variant="plain"
                            className="rounded-[1.75rem]"
                          />
                        </motion.button>
                      ))}
                    </div>
                  ) : null}
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
                            <motion.button
                              key={entry.id}
                              layout="position"
                              type="button"
                              onClick={() => handleSelect(entry)}
                              onMouseEnter={() => setSelectedId(entry.id)}
                              className={cn(
                                "group relative flex w-full items-center gap-3 rounded-[1.125rem] px-3.5 py-3 text-left transition-colors duration-200",
                                isSelected
                                  ? "bg-gradient-to-r from-sky-500/85 via-sky-500/75 to-sky-500/85 text-white shadow-[0_1rem_2.5rem_rgba(56,130,255,0.4)]"
                                  : "bg-white/15 text-slate-900 hover:bg-white/25",
                              )}
                            >
                              <div
                                className={cn(
                                  "flex size-12 shrink-0 items-center justify-center rounded-[1rem] border border-white/40 bg-white/60",
                                  isSelected && "border-white/70 bg-white/25",
                                )}
                              >
                                {appMeta ? (
                                  <AppGlyph app={appMeta} size={32} />
                                ) : (
                                  <div className="flex h-[2rem] w-[2rem] items-center justify-center rounded-[0.75rem] bg-white/30">
                                    <Square
                                      className={cn(
                                        "h-[1rem] w-[1rem]",
                                        isSelected
                                          ? "text-white/80"
                                          : "text-slate-500",
                                      )}
                                    />
                                  </div>
                                )}
                              </div>
                              <div className="flex min-w-0 flex-1 flex-col gap-1">
                                <span className="truncate text-[0.9375rem] font-semibold leading-tight tracking-tight">
                                  {entry.label}
                                </span>
                                {entry.description ? (
                                  <span
                                    className={cn(
                                      "truncate text-[0.75rem] leading-tight",
                                      isSelected
                                        ? "text-white/80"
                                        : "text-slate-500/90",
                                    )}
                                  >
                                    {entry.description}
                                  </span>
                                ) : null}
                              </div>
                              <span
                                className={cn(
                                  "shrink-0 rounded-full px-2 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.08em]",
                                  isSelected
                                    ? "bg-white/15 text-white/90"
                                    : "bg-white/40 text-slate-600",
                                )}
                              >
                                {entry.kind === "app" ? "App" : "Win"}
                              </span>
                            </motion.button>
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
          </div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
