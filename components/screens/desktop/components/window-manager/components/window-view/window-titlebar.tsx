import type React from "react";
import { closeWin, setWinState } from "../../api";
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
  return (
    <div
      className="wm-titlebar h-9 flex items-center gap-2 px-[10px] cursor-grab bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.06))] border-b border-white/15"
      onPointerDown={drag.onPointerDown}
      onPointerMove={drag.onPointerMove}
      onPointerUp={drag.onPointerUp}
      onDoubleClick={onTitleDoubleClick}
      role="toolbar"
      aria-label="Window title bar"
    >
      <div className="flex gap-2 pr-1.5">
        <button
          type="button"
          aria-label="Close"
          onClick={(e) => {
            e.stopPropagation();
            closeWin(win.id);
          }}
          className="h-3 w-3 rounded-full border border-black/15 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)] bg-[#ff5f57]"
        />
        <button
          type="button"
          aria-label="Minimize"
          onClick={(e) => {
            e.stopPropagation();
            setWinState(win.id, "minimized");
          }}
          className="h-3 w-3 rounded-full border border-black/15 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)] bg-[#ffbd2e]"
        />
        <button
          type="button"
          aria-label="Zoom"
          onClick={(e) => {
            e.stopPropagation();
            setWinState(
              win.id,
              win.state === "maximized" ? "normal" : "maximized",
            );
          }}
          className="h-3 w-3 rounded-full border border-black/15 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)] bg-[#28c840]"
        />
      </div>
      <div className="text-[0.75rem] opacity-[0.85]">{win.title}</div>
    </div>
  );
}
