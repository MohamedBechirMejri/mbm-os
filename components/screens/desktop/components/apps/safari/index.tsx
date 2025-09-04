"use client";

import {
  ArrowLeft,
  ArrowRight,
  Globe,
  Plus,
  RotateCw,
  SquareArrowOutUpRight,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type Tab = {
  id: string;
  title: string;
  url: string;
  input: string; // address bar text for this tab
  history: string[];
  historyIndex: number; // points into history
  loading: boolean;
  favicon: string | null;
};

const START_PAGE = "https://duckduckgo.com";

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return START_PAGE;
  try {
    // If it's already a valid absolute URL
    const u = new URL(trimmed);
    return u.toString();
  } catch {
    // If it looks like a domain (has a dot, no spaces), prefix https
    const hasSpace = /\s/.test(trimmed);
    const hasDot = trimmed.includes(".");
    if (!hasSpace && hasDot) return `https://${trimmed}`;
    // Fallback to a search query
    const q = encodeURIComponent(trimmed);
    return `https://duckduckgo.com/?q=${q}`;
  }
}

export function SafariApp({ instanceId: _ }: { instanceId: string }) {
  const [tabs, setTabs] = useState<Tab[]>(() => [
    {
      id: crypto.randomUUID(),
      title: "DuckDuckGo",
      url: START_PAGE,
      input: START_PAGE,
      history: [START_PAGE],
      historyIndex: 0,
      loading: false,
      favicon: "https://www.google.com/s2/favicons?domain=duckduckgo.com&sz=64",
    },
  ]);
  const [activeId, setActiveId] = useState<string>(() =>
    tabs[0] ? tabs[0].id : "",
  );

  // Keep separate refs per tab so we can stop/reload targeted frames
  const frameRefs = useRef<Record<string, HTMLIFrameElement | null>>({});

  const activeTab = useMemo(() => {
    const found = tabs.find((t) => t.id === activeId) ?? tabs[0];
    return (
      found ?? {
        id: "__empty__",
        title: "New Tab",
        url: START_PAGE,
        input: START_PAGE,
        history: [START_PAGE],
        historyIndex: 0,
        loading: false,
        favicon: (() => {
          try {
            const { hostname } = new URL(START_PAGE);
            return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
          } catch {
            return null;
          }
        })(),
      }
    );
  }, [tabs, activeId]);

  function updateTab(id: string, patch: Partial<Tab>) {
    setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  function navigate(id: string, raw: string) {
    const url = normalizeUrl(raw);
    setTabs((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const nextHistory = t.history.slice(0, t.historyIndex + 1).concat(url);
        return {
          ...t,
          url,
          input: url,
          history: nextHistory,
          historyIndex: nextHistory.length - 1,
          loading: true,
          // optimistic favicon from hostname
          favicon: faviconFromUrl(url),
        };
      }),
    );
  }

  function faviconFromUrl(url: string): string | null {
    try {
      const { hostname } = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
    } catch {
      return null;
    }
  }

  function canGoBack(t: Tab): boolean {
    return t.historyIndex > 0;
  }
  function canGoForward(t: Tab): boolean {
    return t.historyIndex < t.history.length - 1;
  }
  function goBack(id: string) {
    setTabs((prev) =>
      prev.map((t) => {
        if (t.id !== id || !canGoBack(t)) return t;
        const idx = t.historyIndex - 1;
        const nextUrl = t.history[idx] ?? t.url;
        return {
          ...t,
          historyIndex: idx,
          url: nextUrl,
          input: nextUrl,
          loading: true,
        };
      }),
    );
  }
  function goForward(id: string) {
    setTabs((prev) =>
      prev.map((t) => {
        if (t.id !== id || !canGoForward(t)) return t;
        const idx = t.historyIndex + 1;
        const nextUrl = t.history[idx] ?? t.url;
        return {
          ...t,
          historyIndex: idx,
          url: nextUrl,
          input: nextUrl,
          loading: true,
        };
      }),
    );
  }

  function reload(id: string) {
    const frame = frameRefs.current[id];
    try {
      // Best-effort reload for cross-origin
      if (frame) {
        // Changing src to same value triggers reload in many browsers
        const current = frame.src;
        frame.src = current;
      }
    } catch {}
    updateTab(id, { loading: true });
  }

  function stop(id: string) {
    const frame = frameRefs.current[id];
    try {
      // window.stop is allowed cross-origin
      frame?.contentWindow?.stop?.();
    } catch {}
    updateTab(id, { loading: false });
  }

  function addTab(url: string = START_PAGE) {
    const id = crypto.randomUUID();
    const tab: Tab = {
      id,
      title: "New Tab",
      url,
      input: url,
      history: [url],
      historyIndex: 0,
      loading: false,
      favicon: faviconFromUrl(url),
    };
    setTabs((prev) => [...prev, tab]);
    setActiveId(id);
  }

  function closeTab(id: string) {
    setTabs((prev) => {
      if (prev.length === 1) {
        // reset to a fresh tab instead of closing last one
        const current = prev[0] ?? {
          id: crypto.randomUUID(),
          title: "New Tab",
          url: START_PAGE,
          input: START_PAGE,
          history: [START_PAGE],
          historyIndex: 0,
          loading: false,
          favicon: faviconFromUrl(START_PAGE),
        };
        return [
          {
            ...current,
            url: START_PAGE,
            input: START_PAGE,
            history: [START_PAGE],
            historyIndex: 0,
            title: "DuckDuckGo",
            loading: false,
            favicon: faviconFromUrl(START_PAGE),
          },
        ];
      }

      const idx = prev.findIndex((t) => t.id === id);
      const next = prev.filter((t) => t.id !== id);
      if (id === activeId) {
        const newIndex = Math.max(0, idx - 1);
        setActiveId(next[newIndex]?.id ?? next[0]?.id ?? activeId);
      }
      return next;
    });
  }

  return (
    <TooltipProvider>
      <div className="flex h-full min-h-[18rem] w-full flex-col overflow-hidden rounded-md">
        {/* Toolbar */}
        <div className="relative z-[1] flex items-center gap-2 border-b border-border/60 bg-background/60 px-2 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/30">
          {/* Nav controls */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Back"
                  disabled={!canGoBack(activeTab)}
                  onClick={() => goBack(activeId)}
                >
                  <ArrowLeft className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Back</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Forward"
                  disabled={!canGoForward(activeTab)}
                  onClick={() => goForward(activeId)}
                >
                  <ArrowRight className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Forward</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={activeTab.loading ? "Stop" : "Reload"}
                  onClick={() =>
                    activeTab.loading ? stop(activeId) : reload(activeId)
                  }
                >
                  {activeTab.loading ? (
                    <X className="size-4" />
                  ) : (
                    <RotateCw className="size-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {activeTab.loading ? "Stop" : "Reload"}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Address bar */}
          <div className="flex min-w-0 flex-1 items-center">
            <div className="relative flex w-full items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1.5 backdrop-blur supports-[backdrop-filter]:bg-background/30">
              <div className="flex size-4 items-center justify-center">
                {activeTab.favicon ? (
                  <Image
                    src={activeTab.favicon}
                    alt="favicon"
                    width={16}
                    height={16}
                    className="rounded-sm"
                  />
                ) : (
                  <Globe className="size-4" />
                )}
              </div>
              <Input
                className="h-7 w-full border-0 bg-transparent p-0 text-[0.9rem] focus-visible:ring-0"
                value={activeTab.input}
                onChange={(e) => updateTab(activeId, { input: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") navigate(activeId, activeTab.input);
                }}
                aria-label="Address and search"
              />
              <Separator orientation="vertical" className="h-5" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Open in new window"
                    onClick={() =>
                      window.open(
                        activeTab.url,
                        "_blank",
                        "noopener,noreferrer",
                      )
                    }
                  >
                    <SquareArrowOutUpRight className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Open in new window</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* New tab */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="New tab"
                onClick={() => addTab()}
              >
                <Plus className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>New tab</TooltipContent>
          </Tooltip>
        </div>

        {/* Tabs strip */}
        <div className="relative z-[1] flex items-center gap-2 overflow-x-auto border-b border-border/60 bg-background/50 px-2 py-1.5 backdrop-blur supports-[backdrop-filter]:bg-background/20">
          <div className="flex min-w-max items-center gap-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                className={cn(
                  "group relative flex max-w-[16rem] items-center gap-2 rounded-md px-3 py-1.5 text-[0.9rem]",
                  t.id === activeId
                    ? "bg-foreground/10"
                    : "hover:bg-foreground/5",
                )}
                type="button"
                onClick={() => setActiveId(t.id)}
                title={t.title}
              >
                {/* favicon */}
                {t.favicon ? (
                  <Image
                    src={t.favicon}
                    alt="favicon"
                    width={16}
                    height={16}
                    className="rounded-sm"
                  />
                ) : (
                  <Globe className="size-4" />
                )}
                <span className="truncate">
                  {(() => {
                    if (t.title) return t.title;
                    try {
                      return new URL(t.url).hostname;
                    } catch {
                      return t.url;
                    }
                  })()}
                </span>
                <button
                  className="ml-1 rounded p-0.5 opacity-70 hover:bg-foreground/10 hover:opacity-100"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(t.id);
                  }}
                  aria-label="Close tab"
                >
                  <X className="size-3.5" />
                </button>
                {t.id === activeId ? (
                  <motion.span
                    layoutId="safari-tab-underline"
                    className="absolute inset-x-2 -bottom-[2px] h-[2px] rounded-full bg-foreground/50"
                  />
                ) : null}
              </button>
            ))}
          </div>
        </div>

        {/* Loading bar */}
        <AnimatePresence>
          {activeTab.loading ? (
            <motion.div
              key="loading"
              className="relative h-0.5 w-full bg-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="absolute left-0 top-0 h-full bg-primary"
                initial={{ width: "0%" }}
                animate={{ width: ["0%", "60%", "85%", "95%"] }}
                transition={{
                  duration: 2.2,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "mirror",
                }}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Content area */}
        <div className="relative flex min-h-0 flex-1">
          {tabs.map((t) => (
            <div
              key={t.id}
              className={cn(
                "absolute inset-0",
                t.id === activeId ? "block" : "hidden",
              )}
            >
              <iframe
                ref={(el) => {
                  frameRefs.current[t.id] = el;
                }}
                title={t.title || t.url}
                src={t.url}
                className="h-full w-full border-0 bg-background"
                onLoad={(e) => {
                  // On load, try to read title if same-origin; ignore errors otherwise
                  const frame = e.currentTarget;
                  let title = t.title;
                  try {
                    title = frame.contentDocument?.title || title;
                  } catch {}
                  updateTab(t.id, { loading: false, title });
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
