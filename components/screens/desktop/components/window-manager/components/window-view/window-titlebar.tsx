import type React from "react";
import { cn } from "@/lib/utils";
import { closeWin, setWinState } from "../../api";
import { useDesktop } from "../../store";
import type { WinInstance } from "../../types";

interface WindowTitlebarProps {
  win: WinInstance;
  drag: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
  };
  onTitleDoubleClick: () => void;
}

export function WindowTitlebar({
  win,
  drag,
  onTitleDoubleClick,
}: WindowTitlebarProps) {
  const meta = useDesktop((s) => s.apps[win.appId]);
  const isResizable = meta?.resizable ?? true;
  const floatingActionBar = meta?.floatingActionBar ?? false;

  return (
    <div
      className={cn(
        "wm-titlebar h-9 flex items-center gap-2 px-4  border border-b-0 border-white/15",
        {
          "absolute top-0 left-0 right-0 z-50": floatingActionBar,
          "bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.06))]":
            !floatingActionBar,
        },
      )}
      onPointerDown={drag.onPointerDown}
      onPointerMove={drag.onPointerMove}
      onPointerUp={drag.onPointerUp}
      onDoubleClick={onTitleDoubleClick}
      role="toolbar"
      aria-label="Window title bar"
    >
      <div className="flex gap-2 pr-1.5">
        <ActionButton
          label="Close"
          onClick={() => closeWin(win.id)}
          className="bg-[#ff5f57]"
        />
        <ActionButton
          label="Minimize"
          onClick={() => setWinState(win.id, "minimized")}
          className="bg-[#ffbd2e]"
        />
        <ActionButton
          label="Zoom"
          onClick={() => {
            if (!isResizable) return;
            setWinState(
              win.id,
              win.state === "maximized" ? "normal" : "maximized",
            );
          }}
          className={`bg-[#28c840] ${!isResizable ? "opacity-50 cursor-not-allowed" : ""}`}
        />
      </div>
      {/* <div className="text-[0.75rem] opacity-[0.85]">{win.title}</div> */}
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  className,
}: {
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        `h-3 w-3 rounded-full border border-black/15 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)] cursor-default`,
        "hover:brightness-90 active:brightness-75",
        className,
      )}
    />
  );
}
