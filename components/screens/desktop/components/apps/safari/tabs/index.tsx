"use client";

import { memo } from "react";
import type { Tab } from "../types";
import { TabButton } from "./tab-button";
import { TabsScrollContainer } from "./tabs-scroll-container";

export type TabsStripProps = {
  tabs: Tab[];
  activeId: string;
  onSetActive: (id: string) => void;
  onClose: (id: string) => void;
};

/**
 * TabsStrip
 * Presentational component that renders horizontally scrollable tabs.
 * Responsibilities:
 *  - Render each TabButton
 *  - Provide keyboard navigation (ArrowLeft/ArrowRight + Ctrl+W to close)
 *  - Simple active-state styling (no underline animation anymore)
 *  - Avoids re-renders via memoization when props unchanged
 */
export const TabsStrip = memo(function TabsStrip({
  tabs,
  activeId,
  onSetActive,
  onClose,
}: TabsStripProps) {
  return (
    <div
      className="relative z-[1] flex items-center gap-2 overflow-x-auto bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/20"
      role="tablist"
      aria-label="Safari Tabs"
    >
      <TabsScrollContainer>
        {tabs.map((t) => (
          <TabButton
            key={t.id}
            tab={t}
            isActive={t.id === activeId}
            onActivate={() => onSetActive(t.id)}
            onClose={() => onClose(t.id)}
          />
        ))}
      </TabsScrollContainer>
    </div>
  );
});
