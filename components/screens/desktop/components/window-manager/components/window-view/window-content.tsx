import { useDesktop } from "../../store";
import type { WinInstance } from "../../types";

interface WindowContentProps {
  win: WinInstance;
}

export function WindowContent({ win }: WindowContentProps) {
  const meta = useDesktop((s) => s.apps[win.appId]);

  return (
    <div className="wm-content absolute inset-0 top-9 overflow-auto w-full h-[calc(100%-36px)]">
      {meta ? <meta.Component instanceId={win.id} /> : null}
    </div>
  );
}
