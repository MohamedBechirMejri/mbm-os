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
          className={`wm-resize-handle ${resizeHandleClass(edge)}`}
          onPointerDown={onPointerDown(edge)}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        />
      ))}
    </>
  );
}

function resizeHandleClass(edge: Edge): string {
  const base = "absolute z-[2]";
  switch (edge) {
    case "t":
      return `${base} top-[-2px] left-2 right-2 h-2 cursor-[ns-resize]`;
    case "b":
      return `${base} bottom-[-2px] left-2 right-2 h-2 cursor-[ns-resize]`;
    case "l":
      return `${base} left-[-2px] top-2 bottom-2 w-2 cursor-[ew-resize]`;
    case "r":
      return `${base} right-[-2px] top-2 bottom-2 w-2 cursor-[ew-resize]`;
    case "tr":
      return `${base} right-[-2px] top-[-2px] w-2 h-2 cursor-[nesw-resize]`;
    case "br":
      return `${base} right-[-2px] bottom-[-2px] w-2 h-2 cursor-[nwse-resize]`;
    case "bl":
      return `${base} left-[-2px] bottom-[-2px] w-2 h-2 cursor-[nesw-resize]`;
    case "tl":
      return `${base} left-[-2px] top-[-2px] w-2 h-2 cursor-[nwse-resize]`;
  }
}
