"use client";

import type React from "react";
import { closeWin, focusWin, setWinState } from "../api";
import { useWindowDrag, useWindowResize } from "../hooks";
import { useDesktop } from "../store";
import type { WinInstance } from "../types";

export function WindowView({
  win,
  rootRef,
}: {
  win: WinInstance;
  rootRef: React.RefObject<HTMLDivElement | null>;
}) {
  const meta = useDesktop((s) => s.apps[win.appId]);

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
      <div
        className="wm-titlebar"
        onPointerDown={drag.onPointerDown}
        onPointerMove={drag.onPointerMove}
        onPointerUp={drag.onPointerUp}
        onDoubleClick={onTitleDoubleClick}
        role="toolbar"
        aria-label="Window title bar"
        style={{
          height: 36,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 10px",
          cursor: "grab",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06))",
          borderBottom: "1px solid rgba(255,255,255,0.14)",
        }}
      >
        <div style={{ display: "flex", gap: 8, paddingRight: 6 }}>
          <button
            type="button"
            aria-label="Close"
            onClick={(e) => {
              e.stopPropagation();
              closeWin(win.id);
            }}
            style={circleBtn("#ff5f57")}
          />
          <button
            type="button"
            aria-label="Minimize"
            onClick={(e) => {
              e.stopPropagation();
              setWinState(win.id, "minimized");
            }}
            style={circleBtn("#ffbd2e")}
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
            style={circleBtn("#28c840")}
          />
        </div>
        <div style={{ fontSize: 12, opacity: 0.85 }}>{win.title}</div>
      </div>

      <div
        className="wm-content w-full bg-rose-400 h-[calc(100%-36px)]"
        style={{ position: "absolute", inset: 0, top: 36, overflow: "auto" }}
      >
        {meta ? <meta.Component instanceId={win.id} /> : null}
      </div>

      {(["t", "r", "b", "l", "tr", "br", "bl", "tl"] as const).map((edge) => (
        <div
          key={edge}
          className="wm-resize-handle"
          onPointerDown={resize.onPointerDown(edge)}
          onPointerMove={resize.onPointerMove}
          onPointerUp={resize.onPointerUp}
          style={resizeHandleStyle(edge)}
        />
      ))}
    </div>
  );
}

function circleBtn(color: string): React.CSSProperties {
  return {
    width: 12,
    height: 12,
    borderRadius: 9999,
    background: color,
    border: "1px solid rgba(0,0,0,0.15)",
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.35)",
    cursor: "pointer",
  };
}

function resizeHandleStyle(
  edge: "t" | "r" | "b" | "l" | "tr" | "br" | "bl" | "tl",
): React.CSSProperties {
  const base: React.CSSProperties = { position: "absolute", zIndex: 2 };
  const size = 8;
  switch (edge) {
    case "t":
      return {
        ...base,
        top: -2,
        left: 8,
        right: 8,
        height: size,
        cursor: "ns-resize",
      };
    case "b":
      return {
        ...base,
        bottom: -2,
        left: 8,
        right: 8,
        height: size,
        cursor: "ns-resize",
      };
    case "l":
      return {
        ...base,
        left: -2,
        top: 8,
        bottom: 8,
        width: size,
        cursor: "ew-resize",
      };
    case "r":
      return {
        ...base,
        right: -2,
        top: 8,
        bottom: 8,
        width: size,
        cursor: "ew-resize",
      };
    case "tr":
      return {
        ...base,
        right: -2,
        top: -2,
        width: size,
        height: size,
        cursor: "nesw-resize",
      };
    case "br":
      return {
        ...base,
        right: -2,
        bottom: -2,
        width: size,
        height: size,
        cursor: "nwse-resize",
      };
    case "bl":
      return {
        ...base,
        left: -2,
        bottom: -2,
        width: size,
        height: size,
        cursor: "nesw-resize",
      };
    case "tl":
      return {
        ...base,
        left: -2,
        top: -2,
        width: size,
        height: size,
        cursor: "nwse-resize",
      };
  }
}
