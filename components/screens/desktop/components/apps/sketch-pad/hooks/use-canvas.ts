import { useCallback, useRef } from "react";
import type { Point, Tool, BrushSettings, Viewport } from "../types";
import { drawLine, drawDot } from "../utils";

interface UseCanvasOptions {
  tool: Tool;
  brush: BrushSettings;
  viewport: Viewport;
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
  viewport,
  onStrokeStart,
  onStrokeEnd,
}: UseCanvasOptions): UseCanvasReturn => {
  // Track if currently drawing
  const isDrawingRef = useRef(false);
  // Last point for line drawing
  const lastPointRef = useRef<Point | null>(null);

  // Get point from pointer event relative to canvas, accounting for viewport
  const getPoint = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>): Point => {
      const canvas = e.currentTarget;
      const rect = canvas.getBoundingClientRect();

      // Get screen position relative to canvas element
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;

      // Transform from screen to canvas coordinates using viewport
      // Account for zoom and offset
      return {
        x: (screenX - viewport.offsetX) / viewport.zoom,
        y: (screenY - viewport.offsetY) / viewport.zoom,
      };
    },
    [viewport]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (tool === "pan") return;

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
      if (!isDrawingRef.current || !lastPointRef.current || tool === "pan")
        return;

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
  }, []);

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerLeave,
  };
};
