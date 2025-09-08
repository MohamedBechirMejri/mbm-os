import { cn } from "@/lib/utils";
import { useDesktop } from "../../store";
import type { WinInstance } from "../../types";

interface WindowContentProps {
  win: WinInstance;
}

export function WindowContent({ win }: WindowContentProps) {
  const meta = useDesktop((s) => s.apps[win.appId]);

  const floatingActionBar = meta?.floatingActionBar ?? false;
  const titlebarHeight = meta?.titlebarHeight ?? 36;

  return (
    <div
      className={cn("wm-content absolute inset-0 overflow-auto w-full ")}
      style={{
        height: floatingActionBar ? "100%" : `calc(100% - ${titlebarHeight}px)`,
        top: floatingActionBar ? 0 : titlebarHeight,
      }}
    >
      {meta ? <meta.Component instanceId={win.id} /> : null}
    </div>
  );
}
