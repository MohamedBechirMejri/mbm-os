import { forwardRef, useCallback } from "react";
import { useCanvas } from "../hooks/use-canvas";
import type { Tool, BrushSettings, Viewport } from "../types";

interface CanvasLayerProps {
  width: number;
  height: number;
  isActive: boolean;
  isVisible: boolean;
  opacity: number;
  tool: Tool;
  brush: BrushSettings;
  viewport: Viewport;
  onStrokeStart: () => void;
  onStrokeEnd: () => void;
}

// Individual canvas layer that handles drawing when active
export const CanvasLayer = forwardRef<HTMLCanvasElement, CanvasLayerProps>(
  function CanvasLayer(
    {
      width,
      height,
      isActive,
      isVisible,
      opacity,
      tool,
      brush,
      viewport,
      onStrokeStart,
      onStrokeEnd,
    },
    ref
  ) {
    const {
      handlePointerDown,
      handlePointerMove,
      handlePointerUp,
      handlePointerLeave,
    } = useCanvas({
      tool,
      brush,
      viewport,
      onStrokeStart,
      onStrokeEnd,
    });

    // Wrapped handlers that only fire when layer is active and not in pan mode
    const onPointerDown = useCallback(
      (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isActive || tool === "pan") return;
        handlePointerDown(e);
      },
      [isActive, tool, handlePointerDown]
    );

    const onPointerMove = useCallback(
      (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isActive || tool === "pan") return;
        handlePointerMove(e);
      },
      [isActive, tool, handlePointerMove]
    );

    return (
      <canvas
        ref={ref}
        width={width}
        height={height}
        className="absolute top-0 left-0 touch-none"
        style={{
          opacity: isVisible ? opacity : 0,
          pointerEvents: isActive && tool !== "pan" ? "auto" : "none",
          // These are handled at the container level now
          transformOrigin: "0 0",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
      />
    );
  }
);
