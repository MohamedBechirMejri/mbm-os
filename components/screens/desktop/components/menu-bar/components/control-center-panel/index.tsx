"use client";

import GlassSurface from "@/components/ui/glass-surface";

type ControlCenterPanelProps = {
  onClose: () => void;
};

export function ControlCenterPanel({ onClose }: ControlCenterPanelProps) {
  return (
    <section className="w-[24rem] space-y-4 text-white">
      <div className="grid grid-cols-2 gap-4">
        <GlassSurface className="!w-full !h-max !bg-black/50">
          <div className="text-sm font-semibold text-white/80">Display</div>
          <div className="mt-4 grid gap-3"></div>
        </GlassSurface>
      </div>
    </section>
  );
}
