import { useCallback, useRef } from "react";
import type { Point, Tool, BrushSettings } from "../types";
import { drawLine, drawDot } from "../utils";

interface UseCanvasOptions {
  tool: Tool;
  brush: BrushSettings;
  onStrokeStart?: () => void;
  onStrokeEnd?: () => void;
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
  onStrokeStart,
  onStrokeEnd,
}: UseCanvasOptions): UseCanvasReturn => {
  // Track if currently drawing
  const isDrawingRef = useRef(false);
  // Last point for line drawing
  const lastPointRef = useRef<Point | null>(null);

  // Get point from pointer event relative to canvas
  const getPoint = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>): Point => {
      const canvas = e.currentTarget;
      const rect = canvas.getBoundingClientRect();

      // Scale coordinates if canvas is CSS-resized
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    },
    []
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = e.currentTarget;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Capture pointer for smoother drawing outside canvas
      canvas.setPointerCapture(e.pointerId);

      isDrawingRef.current = true;
      const point = getPoint(e);
      lastPointRef.current = point;

      // Notify parent that stroke is starting (for history snapshot)
      onStrokeStart?.();

      // Draw initial dot
      drawDot(ctx, point, brush.size, brush.color, tool === "eraser");
    },
    [brush, tool, getPoint, onStrokeStart]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current || !lastPointRef.current) return;

      const canvas = e.currentTarget;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const point = getPoint(e);

      // Draw line from last point to current point
      drawLine(
        ctx,
        lastPointRef.current,
        point,
        brush.size,
        brush.color,
        tool === "eraser"
      );

      lastPointRef.current = point;
    },
    [brush, tool, getPoint]
  );

  const handlePointerUp = useCallback(() => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      lastPointRef.current = null;
      onStrokeEnd?.();
    }
  }, [onStrokeEnd]);

  const handlePointerLeave = useCallback(() => {
    // Don't stop drawing on leave - pointer capture handles this
    // Only reset if not drawing (prevents accidental stroke ends)
  }, []);

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerLeave,
  };
};
