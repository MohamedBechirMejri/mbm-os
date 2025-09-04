"use client";

import { cn } from "@/lib/utils";
import type { Tab } from "./types";

type Props = {
  tabs: Tab[];
  activeId: string;
  setFrameRef: (id: string, el: HTMLIFrameElement | null) => void;
  onTabLoaded: (id: string, title: string | undefined) => void;
};

export function ContentView({
  tabs,
  activeId,
  setFrameRef,
  onTabLoaded,
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
            ref={(el) => setFrameRef(t.id, el)}
            title={t.title || t.url}
            src={t.url}
            className="h-full w-full border-0 bg-background"
            onLoad={(e) => {
              const frame = e.currentTarget;
              let title = t.title;
              try {
                title = frame.contentDocument?.title || title;
              } catch {}
              onTabLoaded(t.id, title);
            }}
          />
        </div>
      ))}
    </div>
  );
}
