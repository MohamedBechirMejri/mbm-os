import { Monitor } from "lucide-react";
import { motion } from "motion/react";
import type {
  AppMeta,
  WinInstance,
} from "@/components/screens/desktop/components/window-manager";
import { Button } from "@/components/ui/button";

import type { SessionStat } from "../hooks/use-calendar-panel";
import { AppGlyph } from "./app-glyph";

type ActiveSessionSectionProps = {
  activeWindow: WinInstance | null;
  activeMeta?: AppMeta;
  activeStateLabel?: string;
  sessionStats: SessionStat[];
  uniqueAppsCount: number;
  onFocusWindow: (win: WinInstance) => void;
};

export function ActiveSessionSection({
  activeWindow,
  activeMeta,
  activeStateLabel,
  sessionStats,
  uniqueAppsCount,
  onFocusWindow,
}: ActiveSessionSectionProps) {
  return (
    <section className="rounded-3xl border border-white/12 bg-white/10 p-4">
      <header className="flex items-center justify-between text-xs uppercase tracking-[0.2rem] text-white/60">
        <span>Active Session</span>
        <span>
          {uniqueAppsCount} app{uniqueAppsCount === 1 ? "" : "s"}
        </span>
      </header>
      <motion.div
        layout
        className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/12 p-4"
      >
        <span className="flex size-11 items-center justify-center rounded-xl border border-white/15 bg-white/10">
          {activeMeta ? (
            <AppGlyph app={activeMeta} />
          ) : (
            <Monitor className="size-4 text-white/70" />
          )}
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold">
            {activeWindow ? activeWindow.title : "Nothing focused"}
          </p>
          <p className="text-xs text-white/65">
            {activeWindow && activeMeta
              ? `${activeMeta.title} • ${activeStateLabel ?? activeWindow.state}`
              : "Pick a window to bring it to the front."}
          </p>
        </div>
        {activeWindow ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => onFocusWindow(activeWindow)}
            className="rounded-xl border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/75 transition hover:border-white/25 hover:bg-white/20 hover:text-white"
          >
            Focus
          </Button>
        ) : null}
      </motion.div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {sessionStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-white/10 bg-white/12 px-4 py-3"
          >
            <p className="text-xs text-white/55">{stat.label}</p>
            <p className="mt-1 text-base font-semibold text-white">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
