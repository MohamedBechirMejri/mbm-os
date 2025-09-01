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

  const style: React.CSSProperties = {
    position: "absolute",
    left: 0,
    top: 0,
    transform: `translate3d(${win.bounds.x}px, ${win.bounds.y}px, 0)`,
    width: win.bounds.w,
    height: win.bounds.h,
    zIndex: win.z,
    borderRadius: 12,
    overflow: "hidden",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.18)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    boxShadow: win.focused
      ? "0 10px 32px rgba(0,0,0,0.45)"
      : "0 10px 28px rgba(0,0,0,0.28)",
    outline: win.focused
      ? "1px solid rgba(255,255,255,0.25)"
      : "1px solid rgba(255,255,255,0.12)",
    userSelect: "none",
  };

  const onTitleDoubleClick = () => {
    setWinState(win.id, win.state === "maximized" ? "normal" : "maximized");
  };

  return (
    <div
      className="wm-window"
      style={style}
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
