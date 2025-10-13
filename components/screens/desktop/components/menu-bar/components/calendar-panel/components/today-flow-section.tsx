import { Clock3, Monitor } from "lucide-react";
import { motion } from "motion/react";
import { type WinInstance } from "@/components/screens/desktop/components/window-manager";

import { type TodayEntry } from "../hooks/use-calendar-panel";
import { AppGlyph } from "./app-glyph";

type TodayFlowSectionProps = {
  totalCount: number;
  entries: TodayEntry[];
  onFocusWindow: (win: WinInstance) => void;
};

export function TodayFlowSection({
  totalCount,
  entries,
  onFocusWindow,
}: TodayFlowSectionProps) {
  return (
    <section className="rounded-3xl border border-white/12 bg-white/10 p-4">
      <header className="flex items-center justify-between text-xs uppercase tracking-[0.2rem] text-white/60">
        <span className="flex items-center gap-2">
          <Clock3 className="size-3.5" /> Today’s Flow
        </span>
        <span>
          {totalCount} session{totalCount === 1 ? "" : "s"}
        </span>
      </header>
      <div className="mt-4 space-y-3">
        {totalCount === 0 ? (
          <p className="text-sm text-white/65">
            Launch an app to start logging today’s usage.
          </p>
        ) : (
          entries.map((entry) => (
            <motion.button
              key={entry.win.id}
              type="button"
              whileHover={{ translateY: -2 }}
              whileTap={{ translateY: 0 }}
              onClick={() => onFocusWindow(entry.win)}
              className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/12 px-4 py-3 text-left text-white/80 transition hover:border-white/20 hover:bg-white/16 hover:text-white"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl border border-white/15 bg-white/10">
                  {entry.meta ? (
                    <AppGlyph app={entry.meta} />
                  ) : (
                    <Monitor className="size-4 text-white/70" />
                  )}
                </span>
                <div>
                  <p className="text-sm font-semibold leading-tight">
                    {entry.win.title}
                  </p>
                  <p className="text-xs text-white/65">
                    {entry.createdAtLabel}
                    {entry.meta ? ` • ${entry.meta.title}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end text-xs text-white/55">
                <span>{entry.stateLabel}</span>
                <span className="text-[0.65rem] uppercase tracking-wider">
                  Focus
                </span>
              </div>
            </motion.button>
          ))
        )}
      </div>
    </section>
  );
}
