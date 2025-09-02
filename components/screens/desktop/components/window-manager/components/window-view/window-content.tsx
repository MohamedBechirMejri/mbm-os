import { cn } from "@/lib/utils";
import { useDesktop } from "../../store";
import type { WinInstance } from "../../types";

interface WindowContentProps {
  win: WinInstance;
}

export function WindowContent({ win }: WindowContentProps) {
  const meta = useDesktop((s) => s.apps[win.appId]);

  const floatingActionBar = meta?.floatingActionBar ?? false;

  return (
    <div
      className={cn("wm-content absolute inset-0 overflow-auto w-full ", {
        "h-full top-0": floatingActionBar,
        "h-[calc(100%-36px)] top-9": !floatingActionBar,
      })}
    >
      {meta ? <meta.Component instanceId={win.id} /> : null}
    </div>
  );
}
