"use client";

import { Settings } from "lucide-react";
import { useMemo } from "react";
import { useDesktop } from "@/components/screens/desktop/components/window-manager";
import GlassSurface from "@/components/ui/glass-surface";

type ControlCenterPanelProps = {
  onClose: () => void;
};

export function ControlCenterPanel({ onClose }: ControlCenterPanelProps) {
  const desktop = useDesktop((state) => state);

  const runningWindows = useMemo(() => {
    return Object.values(desktop.windows)
      .sort((a, b) => b.z - a.z)
      .slice(0, 5);
  }, [desktop.windows]);

  return (
    <section className="w-[24rem] space-y-4 text-white">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold leading-tight">Control Center</p>
          <p className="text-xs text-white/60">
            {runningWindows.length} window
            {runningWindows.length === 1 ? "" : "s"} in this session
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex size-9 items-center justify-center rounded-2xl border border-white/15 bg-white/15 text-white/70 transition-colors hover:bg-white/25"
          aria-label="Close control center"
        >
          <Settings className="size-4" />
        </button>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <GlassSurface className="!w-full !h-max !bg-black/50">
          <div className="text-sm font-semibold text-white/80">
            Window controls
          </div>
          <div className="mt-4 grid gap-3"></div>
        </GlassSurface>
      </div>
    </section>
  );
}
