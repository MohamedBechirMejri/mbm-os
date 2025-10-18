import { Square } from "lucide-react";

import type { AppMeta } from "@/components/screens/desktop/components/window-manager";
import { cn } from "@/lib/utils";
import { AppGlyph } from "./app-glyph";
import type { SearchEntry } from "./types";

type SearchResultItemProps = {
  entry: SearchEntry;
  isSelected: boolean;
  appMeta: AppMeta | null;
  onSelect: (entry: SearchEntry) => void;
  onHover: (id: string) => void;
};

export function SearchResultItem({
  entry,
  isSelected,
  appMeta,
  onSelect,
  onHover,
}: SearchResultItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(entry)}
      onMouseEnter={() => onHover(entry.id)}
      className={cn(
        "group relative flex w-full items-center gap-3 rounded-[1.125rem] px-3.5 py-3 text-left transition-all duration-150",
        isSelected
          ? "bg-gradient-to-b from-sky-500 to-sky-600 text-white shadow-[0_0.5rem_1.5rem_rgba(56,130,255,0.35),inset_0_1px_1px_rgba(255,255,255,0.25)]"
          : "bg-white/20 text-slate-900 hover:bg-white/35 shadow-[inset_0_0.5px_1px_rgba(255,255,255,0.3)]",
      )}
    >
      <div
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-[1rem] border border-white/50 bg-white/70 shadow-[0_1px_3px_rgba(0,0,0,0.08)]",
          isSelected &&
            "border-white/80 bg-white/35 shadow-[0_2px_6px_rgba(0,0,0,0.12)]",
        )}
      >
        {appMeta ? (
          <AppGlyph app={appMeta} size={32} />
        ) : (
          <div className="flex h-[2rem] w-[2rem] items-center justify-center rounded-[0.75rem] bg-white/30">
            <Square
              className={cn(
                "h-[1rem] w-[1rem]",
                isSelected ? "text-white/80" : "text-slate-500",
              )}
            />
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-[0.9375rem] font-semibold leading-tight tracking-[-0.01em]">
          {entry.label}
        </span>
        {entry.description ? (
          <span
            className={cn(
              "truncate text-[0.75rem] leading-tight font-medium",
              isSelected ? "text-white/85" : "text-slate-600/90",
            )}
          >
            {entry.description}
          </span>
        ) : null}
      </div>
      <span
        className={cn(
          "shrink-0 rounded-full px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.08em]",
          isSelected
            ? "bg-white/20 text-white shadow-[inset_0_0.5px_1px_rgba(255,255,255,0.3)]"
            : "bg-white/50 text-slate-700/90 shadow-[0_1px_2px_rgba(0,0,0,0.06)]",
        )}
      >
        {entry.kind === "app" ? "App" : "Win"}
      </span>
    </button>
  );
}
