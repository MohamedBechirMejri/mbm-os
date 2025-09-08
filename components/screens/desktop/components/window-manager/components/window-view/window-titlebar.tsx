import type React from "react";
import { cn } from "@/lib/utils";
import { closeWin, setWinState } from "../../api";
import { useDesktop } from "../../store";
import type { WinInstance } from "../../types";

// Titlebar content is provided by a portal from inside apps; the mount ref is
// passed from the parent window view.

interface WindowTitlebarProps {
  win: WinInstance;
  drag: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
  };
  onTitleDoubleClick: () => void;
  mountRef: React.RefObject<HTMLDivElement | null>;
}

export function WindowTitlebar({
  win,
  drag,
  onTitleDoubleClick,
  mountRef,
}: WindowTitlebarProps) {
  const meta = useDesktop((s) => s.apps[win.appId]);
  const isResizable = meta?.resizable ?? true;
  const floatingActionBar = meta?.floatingActionBar ?? false;
  const titlebarHeight = meta?.titlebarHeight ?? 36;

  return (
    <div
      className={cn(
        "wm-titlebar flex items-center gap-2 px-3 border border-b-0 border-white/15 cursor-grab active:cursor-grabbing",
        {
          "absolute top-0 left-0 right-0 z-50": floatingActionBar,
          "bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.06))]":
            !floatingActionBar,
        },
      )}
      style={{
        height: titlebarHeight,
      }}
      onPointerDown={(e) => {
        // Start drag unless the initial target is an interactive control.
        const target = e.target as HTMLElement;
        const noDrag = target.closest(
          'input, textarea, button, a, [role="button"], [role="textbox"], [contenteditable="true"], .no-window-drag',
        );
        if (noDrag) return; // let the control handle the event
        drag.onPointerDown(e);
      }}
      onPointerMove={drag.onPointerMove}
      onPointerUp={drag.onPointerUp}
      onDoubleClick={onTitleDoubleClick}
      role="toolbar"
      aria-label="Window title bar"
    >
      {/* Traffic lights */}
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

      {/* Content area: apps can portal into here */}
      <div
        ref={mountRef}
        className="wm-titlebar-content pointer-events-auto flex min-w-0 flex-1 items-center"
      />
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
