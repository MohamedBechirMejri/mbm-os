"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Tab, TabMode } from "./types";

type Props = {
  tabs: Tab[];
  activeId: string;
  onTabLoaded: (
    id: string,
    payload: { title?: string; restricted: boolean },
  ) => void;
  onRequestModeChange: (id: string, mode: TabMode) => void;
  onOpenInNewWindow: (url: string) => void;
};

export function ContentView({
  tabs,
  activeId,
  onTabLoaded,
  onRequestModeChange,
  onOpenInNewWindow,
}: Props) {
  return (
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
            key={`${t.id}-${t.mode}-${t.revision}`}
            title={t.title || t.url}
            src={t.frameUrl}
            className="h-full w-full border-0 bg-background"
            onLoad={(e) => {
              const frame = e.currentTarget;
              let title = t.title;
              let restricted = false;
              try {
                title = frame.contentDocument?.title || title;
              } catch {
                restricted = true;
              }
              onTabLoaded(t.id, { title, restricted });
            }}
            sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms allow-pointer-lock allow-same-origin"
          />
          {t.restricted && t.mode === "direct" ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-md">
              <div className="pointer-events-auto flex max-w-[32rem] flex-col gap-4 rounded-2xl border border-white/15 bg-black/70 p-6 text-white shadow-2xl">
                <div className="flex flex-col gap-1">
                  <h2 className="text-[1.05rem] font-semibold tracking-tight">
                    This page refuses to be embedded.
                  </h2>
                  <p className="text-[0.95rem] text-white/75">
                    Most modern sites send anti-iframe headers. You can still
                    open the page externally or try a lightweight reader mode.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => onOpenInNewWindow(t.url)}
                  >
                    Open in browser
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onRequestModeChange(t.id, "reader")}
                  >
                    Try reader mode
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
          {t.mode === "reader" ? (
            <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-4 py-2 text-[0.85rem] text-white/80">
              <span>Reader mode</span>
              <Button
                size="sm"
                variant="ghost"
                className="pointer-events-auto h-7 rounded-full px-3 text-[0.8rem] text-white/90 hover:bg-white/15"
                onClick={() => onRequestModeChange(t.id, "direct")}
              >
                Back to full site
              </Button>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
