import { useDesktop } from "../../store";
import type { WinInstance } from "../../types";

interface WindowContentProps {
  win: WinInstance;
}

export function WindowContent({ win }: WindowContentProps) {
  const meta = useDesktop((s) => s.apps[win.appId]);

  return (
    <div
      className="wm-content w-full bg-rose-400 h-[calc(100%-36px)]"
      style={{ position: "absolute", inset: 0, top: 36, overflow: "auto" }}
    >
      {meta ? <meta.Component instanceId={win.id} /> : null}
    </div>
  );
}
