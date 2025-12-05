import { forwardRef, useCallback } from "react";
import { useCanvas } from "../hooks/use-canvas";
import type { Tool, BrushSettings } from "../types";

interface CanvasLayerProps {
  width: number;
  height: number;
  isActive: boolean;
  isVisible: boolean;
  opacity: number;
  tool: Tool;
  brush: BrushSettings;
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
      onStrokeStart,
      onStrokeEnd,
    });

    // Wrapped handlers that only fire when layer is active
    const onPointerDown = useCallback(
      (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isActive) return;
        handlePointerDown(e);
      },
      [isActive, handlePointerDown]
    );

    const onPointerMove = useCallback(
      (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isActive) return;
        handlePointerMove(e);
      },
      [isActive, handlePointerMove]
    );

    return (
      <canvas
        ref={ref}
        width={width}
        height={height}
        className="absolute inset-0 touch-none"
        style={{
          opacity: isVisible ? opacity : 0,
          pointerEvents: isActive ? "auto" : "none",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
      />
    );
  }
);
