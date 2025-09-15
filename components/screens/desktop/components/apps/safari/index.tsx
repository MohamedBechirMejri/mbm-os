"use client";

import { useMemo, useRef, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TitlebarPortal } from "../../window-manager/components/window-view/titlebar-portal";
import { ContentView } from "./content-view";
import { LoadingBar } from "./loading-bar";
import { TabsStrip } from "./tabs";
import { Toolbar } from "./toolbar";
import type { Tab } from "./types";
import { START_PAGE } from "./types";
import { faviconFromUrl, normalizeUrl } from "./utils";

export function SafariApp({ instanceId: _ }: { instanceId: string }) {
  const [tabs, setTabs] = useState<Tab[]>(() => [
    {
      id: crypto.randomUUID(),
      title: "Mohamed Bechir Mejri",
      url: START_PAGE,
      input: START_PAGE,
      history: [START_PAGE],
      historyIndex: 0,
      loading: false,
      favicon:
        "https://www.google.com/s2/favicons?domain=mohamedbechirmejri.dev&sz=64",
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
            title: "Mohamed Bechir Mejri",
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
          setFrameRef={(id: string, el: HTMLIFrameElement | null) => {
            frameRefs.current[id] = el;
          }}
          onTabLoaded={(id: string, title: string | undefined) =>
            updateTab(id, { loading: false, title })
          }
        />
      </div>
    </TooltipProvider>
  );
}
