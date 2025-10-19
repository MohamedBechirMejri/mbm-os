"use client";

import { useEffect, useRef } from "react";
import { useDesktop } from "../store";
import { WindowView } from "./window-view";

export function WindowManagerRoot({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.id = "wm-root";
  }, []);

  const ids = useDesktop((s) => s.order);
  const windows = useDesktop((s) => s.windows);

  return (
    <div
      ref={ref}
      className={className}
      style={{ position: "absolute", inset: 0, overflow: "hidden" }}
    >
      {ids.map((id) => {
        const w = windows[id];
        if (!w || w.state === "hidden") return null;
        return <WindowView key={id} win={w} rootRef={ref} />;
      })}
    </div>
  );
}
