import type React from "react";

type Edge = "t" | "r" | "b" | "l" | "tr" | "br" | "bl" | "tl";

interface ResizeHandlersProps {
  onPointerDown: (edge: Edge) => (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
}

export function WindowResizeHandles({
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: ResizeHandlersProps) {
  const edges: Edge[] = ["t", "r", "b", "l", "tr", "br", "bl", "tl"];
  return (
    <>
      {edges.map((edge) => (
        <div
          key={edge}
          className="wm-resize-handle"
          onPointerDown={onPointerDown(edge)}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          style={resizeHandleStyle(edge)}
        />
      ))}
    </>
  );
}

function resizeHandleStyle(edge: Edge): React.CSSProperties {
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
