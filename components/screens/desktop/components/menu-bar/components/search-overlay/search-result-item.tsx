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
                isSelected ? "text-white/80" : "text-slate-500",
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
              isSelected ? "text-white/80" : "text-slate-500/90",
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
    </button>
  );
}
