"use client";

import { AnimatePresence, motion } from "motion/react";

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

export function SearchResults({
  visible,
  filtered,
  activeId,
  appsById,
  onSelect,
  onHover,
}: SearchResultsProps) {
  return (
    <AnimatePresence initial={false}>
      {visible ? (
        <motion.div
          key="results"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative border-t border-white/25 bg-white/30 px-3 pb-3 pt-2 backdrop-blur-[64px] overflow-hidden"
        >
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
            <div className="px-4 py-6 text-center text-[0.875rem] font-medium text-slate-500">
              No results
            </div>
          )}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
