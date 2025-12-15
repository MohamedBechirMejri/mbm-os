import { useCallback, useRef } from "react";
import type { BrushSettings, Point, Tool, Viewport } from "../types";

interface UseCanvasOptions {
  tool: Tool;
  brush: BrushSettings;
  viewport: Viewport;
  layerId: string;
  onStrokeStart?: (
    layerId: string,
    point: Point,
    size: number,
    color: string
  ) => void;
  onStrokePoint?: (point: Point) => void;
  onStrokeEnd?: () => void;
  onErasePoint?: (point: Point, layerId: string) => void;
  onEraseEnd?: () => void;
}

interface UseCanvasReturn {
  handlePointerDown: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  handlePointerMove: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  handlePointerUp: () => void;
  handlePointerLeave: () => void;
}

export const useCanvas = ({
  tool,
  brush,
  viewport,
  layerId,
  onStrokeStart,
  onStrokePoint,
  onStrokeEnd,
  onErasePoint,
  onEraseEnd,
}: UseCanvasOptions): UseCanvasReturn => {
  // Track if currently drawing/erasing
  const isDrawingRef = useRef(false);

  // Get point from pointer event relative to canvas, accounting for viewport
  const getPoint = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>): Point => {
      const canvas = e.currentTarget;
      const rect = canvas.getBoundingClientRect();

      // Get screen position relative to the transformed canvas element
      // getBoundingClientRect() already accounts for CSS transforms (translate/scale)
      // so we only need to account for the zoom scale, not the offset
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;

      // Only divide by zoom since the rect position already includes the offset
      return {
        x: screenX / viewport.zoom,
        y: screenY / viewport.zoom,
      };
    },
    [viewport]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (tool === "pan") return;

      const canvas = e.currentTarget;
      // Capture pointer for smoother drawing outside canvas
      canvas.setPointerCapture(e.pointerId);

      isDrawingRef.current = true;
      const point = getPoint(e);

      if (tool === "brush") {
        // Start a new stroke
        onStrokeStart?.(layerId, point, brush.size, brush.color);
      } else if (tool === "eraser") {
        // Delete strokes at this point
        onErasePoint?.(point, layerId);
      }
    },
    [brush, tool, layerId, getPoint, onStrokeStart, onErasePoint]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current || tool === "pan") return;

      const point = getPoint(e);

      if (tool === "brush") {
        // Add point to current stroke
        onStrokePoint?.(point);
      } else if (tool === "eraser") {
        // Delete strokes at this point
        onErasePoint?.(point, layerId);
      }
    },
    [tool, layerId, getPoint, onStrokePoint, onErasePoint]
  );

  const handlePointerUp = useCallback(() => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      if (tool === "brush") {
        onStrokeEnd?.();
      } else if (tool === "eraser") {
        onEraseEnd?.();
      }
    }
  }, [tool, onStrokeEnd, onEraseEnd]);

  const handlePointerLeave = useCallback(() => {
    // Don't stop drawing on leave - pointer capture handles this
  }, []);

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerLeave,
  };
};
