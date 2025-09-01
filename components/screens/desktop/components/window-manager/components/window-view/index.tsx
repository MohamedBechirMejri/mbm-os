"use client";

import type React from "react";
import { focusWin, setWinState } from "../../api";
import { useWindowDrag, useWindowResize } from "../../hooks";
import type { WinInstance } from "../../types";
import { WindowContent } from "./window-content";
import { WindowResizeHandles } from "./window-resize-handles";
import { WindowTitlebar } from "./window-titlebar";

export function WindowView({
  win,
  rootRef,
}: {
  win: WinInstance;
  rootRef: React.RefObject<HTMLDivElement | null>;
}) {
  const drag = useWindowDrag(win, rootRef);
  const resize = useWindowResize(win, rootRef);

  // Dynamic layout (position/size/z) stays in style; visual styles use Tailwind
  const dynamicStyle: React.CSSProperties = {
    transform: `translate3d(${win.bounds.x}px, ${win.bounds.y}px, 0)`,
    width: win.bounds.w,
    height: win.bounds.h,
    zIndex: win.z,
  };

  const onTitleDoubleClick = () => {
    setWinState(win.id, win.state === "maximized" ? "normal" : "maximized");
  };

  return (
    <div
      className={
        `wm-window absolute left-0 top-0 rounded-xl overflow-hidden select-none ` +
        `bg-[rgba(255,255,255,0.06)] backdrop-blur-[20px] ` +
        (win.focused
          ? "shadow-[0_10px_32px_rgba(0,0,0,0.45)]"
          : "shadow-[0_10px_28px_rgba(0,0,0,0.28)]")
      }
      style={dynamicStyle}
      onPointerDown={() => focusWin(win.id)}
    >
      <WindowTitlebar
        win={win}
        drag={drag}
        onTitleDoubleClick={onTitleDoubleClick}
      />

      <WindowContent win={win} />

      <WindowResizeHandles
        onPointerDown={resize.onPointerDown}
        onPointerMove={resize.onPointerMove}
        onPointerUp={resize.onPointerUp}
      />
    </div>
  );
}
