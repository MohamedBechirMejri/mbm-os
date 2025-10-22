"use client";

import { useMemo, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TitlebarPortal } from "../../window-manager/components/window-view/titlebar-portal";
import { ContentView } from "./content-view";
import { LoadingBar } from "./loading-bar";
import { TabsStrip } from "./tabs";
import { Toolbar } from "./toolbar";
import type { Tab, TabMode } from "./types";
import { START_PAGE } from "./types";
import { faviconFromUrl, frameUrlFor, normalizeUrl } from "./utils";

export function SafariApp({ instanceId: _ }: { instanceId: string }) {
  const [tabs, setTabs] = useState<Tab[]>(() => {
    const initial: Tab = {
      id: crypto.randomUUID(),
      title: "Mohamed Bechir Mejri",
      url: START_PAGE,
      input: START_PAGE,
      history: [START_PAGE],
      historyIndex: 0,
      loading: false,
      favicon: faviconFromUrl(START_PAGE),
      frameUrl: frameUrlFor(START_PAGE, "direct"),
      revision: 0,
      mode: "direct",
      restricted: false,
    };
    return [initial];
  });
  const [activeId, setActiveId] = useState<string>(() =>
    tabs[0] ? tabs[0].id : "",
  );

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
        favicon: faviconFromUrl(START_PAGE),
        frameUrl: frameUrlFor(START_PAGE, "direct"),
        revision: 0,
        mode: "direct",
        restricted: false,
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
          frameUrl: frameUrlFor(url, "direct"),
          revision: t.revision + 1,
          mode: "direct",
          restricted: false,
        };
      }),
    );
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
          frameUrl: frameUrlFor(nextUrl, "direct"),
          revision: t.revision + 1,
          mode: "direct",
          restricted: false,
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
          frameUrl: frameUrlFor(nextUrl, "direct"),
          revision: t.revision + 1,
          mode: "direct",
          restricted: false,
        };
      }),
    );
  }

  function reload(id: string) {
    setTabs((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              revision: t.revision + 1,
              loading: true,
              restricted: false,
            }
          : t,
      ),
    );
  }

  function stop(id: string) {
    updateTab(id, { loading: false });
  }

  function addTab(url: string = START_PAGE) {
    const normalized = normalizeUrl(url);
    const id = crypto.randomUUID();
    const tab: Tab = {
      id,
      title: "New Tab",
      url: normalized,
      input: normalized,
      history: [normalized],
      historyIndex: 0,
      loading: false,
      favicon: faviconFromUrl(normalized),
      frameUrl: frameUrlFor(normalized, "direct"),
      revision: 0,
      mode: "direct",
      restricted: false,
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
          frameUrl: frameUrlFor(START_PAGE, "direct"),
          revision: 0,
          mode: "direct",
          restricted: false,
        };
        return [
          {
            ...current,
            url: START_PAGE,
            input: START_PAGE,
            history: [START_PAGE],
            historyIndex: 0,
            title: "Mohamed Bechir Mejri",
            loading: false,
            favicon: faviconFromUrl(START_PAGE),
            frameUrl: frameUrlFor(START_PAGE, "direct"),
            revision: current.revision + 1,
            mode: "direct",
            restricted: false,
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

  function handleTabLoaded(
    id: string,
    payload: { title?: string; restricted: boolean },
  ) {
    setTabs((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        return {
          ...t,
          title: payload.title ?? t.title,
          loading: false,
          restricted: payload.restricted && t.mode === "direct",
        };
      }),
    );
  }

  function handleModeChange(id: string, mode: TabMode) {
    setTabs((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        return {
          ...t,
          mode,
          frameUrl: frameUrlFor(t.url, mode),
          revision: t.revision + 1,
          loading: true,
          restricted: false,
        };
      }),
    );
  }

  function handleOpenExternal(url: string) {
    if (typeof globalThis === "undefined") return;
    const candidate = (
      globalThis as typeof globalThis & {
        open?: (
          input?: string,
          target?: string,
          features?: string,
        ) => Window | null;
      }
    ).open;
    if (typeof candidate === "function") {
      candidate.call(globalThis, url, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <TooltipProvider>
      <div className="flex h-full min-h-[18rem] w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-black/75 via-black/60 to-black/80">
        <TitlebarPortal>
          <Toolbar
            activeTab={activeTab}
            canGoBack={canGoBack(activeTab)}
            canGoForward={canGoForward(activeTab)}
            onBack={() => goBack(activeId)}
            onForward={() => goForward(activeId)}
            onReload={() => reload(activeId)}
            onStop={() => stop(activeId)}
            onNavigate={(raw: string) => navigate(activeId, raw)}
            onInputChange={(value: string) =>
              updateTab(activeId, { input: value })
            }
            onNewTab={() => addTab()}
            onOpenExternal={() => handleOpenExternal(activeTab.url)}
          />
        </TitlebarPortal>

        {tabs.length > 1 && (
          <TabsStrip
            tabs={tabs}
            activeId={activeId}
            onSetActive={setActiveId}
            onClose={closeTab}
          />
        )}

        <LoadingBar loading={activeTab.loading} />

        <ContentView
          tabs={tabs}
          activeId={activeId}
          onTabLoaded={handleTabLoaded}
          onRequestModeChange={handleModeChange}
          onOpenInNewWindow={handleOpenExternal}
        />
      </div>
    </TooltipProvider>
  );
}
