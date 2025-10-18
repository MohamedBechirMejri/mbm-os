"use client";

import { motion } from "motion/react";

import type { AppMeta } from "@/components/screens/desktop/components/window-manager";
import { SearchResultItem } from "../search-result-item";
import type { SearchEntry } from "../types";

type SearchResultsProps = {
  visible: boolean;
  filtered: SearchEntry[];
  activeId: string | null;
  appsById: Map<string, AppMeta>;
  onSelect: (entry: SearchEntry) => void;
  onHover: (id: string) => void;
};

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

export function SearchResults({
  visible,
  filtered,
  activeId,
  appsById,
  onSelect,
  onHover,
}: SearchResultsProps) {
  return (
    <motion.div
      initial={false}
      animate={{
        opacity: visible ? 1 : 0,
        height: visible ? "auto" : 0,
        y: visible ? 0 : -12,
        scaleY: visible ? 1 : 0.95,
        borderColor: visible
          ? "rgba(255, 255, 255, 0.32)"
          : "rgba(255, 255, 255, 0)",
      }}
      transition={{
        opacity: { duration: 0.24, ease: easeOutExpo },
        height: { duration: 0.28, ease: easeOutExpo },
        y: { duration: 0.26, ease: easeOutExpo },
        scaleY: { duration: 0.26, ease: easeOutExpo },
        borderColor: { duration: 0.26, ease: easeOutExpo },
      }}
      style={{
        transformOrigin: "50% 0%",
        pointerEvents: visible ? "auto" : "none",
        overflow: "hidden",
      }}
      className="relative backdrop-blur-[64px]"
      aria-hidden={!visible}
    >
      <div className="px-4 pb-3.5 pt-2.5">
        {filtered.length > 0 ? (
          <div className="max-h-[26rem] space-y-1.5 overflow-y-auto pr-1.5">
            {filtered.map((entry) => {
              const appMeta = entry.appId ? appsById.get(entry.appId) : null;
              const isSelected = entry.id === activeId;

              return (
                <SearchResultItem
                  key={entry.id}
                  entry={entry}
                  isSelected={isSelected}
                  appMeta={appMeta ?? null}
                  onSelect={onSelect}
                  onHover={onHover}
                />
              );
            })}
          </div>
        ) : (
          <div className="px-4 py-6 text-center text-[0.875rem] font-semibold text-slate-600/90">
            No results
          </div>
        )}
      </div>
    </motion.div>
  );
}
