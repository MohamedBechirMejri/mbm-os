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
      <div style={{ fontSize: "0.75rem", opacity: 0.85 }}>{win.title}</div>
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
