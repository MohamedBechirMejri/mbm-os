import { useCallback, useRef, useState } from "react";
import type { Point, Viewport } from "../types";

// Zoom constraints
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.1;

interface UseViewportReturn {
  viewport: Viewport;
  setViewport: React.Dispatch<React.SetStateAction<Viewport>>;
  handleWheel: (e: React.WheelEvent) => void;
  handlePanStart: (e: React.PointerEvent) => void;
  handlePanMove: (e: React.PointerEvent) => void;
  handlePanEnd: () => void;
  isPanning: boolean;
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  screenToCanvas: (screenX: number, screenY: number) => Point;
}

export const useViewport = (): UseViewportReturn => {
  // Start at origin - the parent will center the view on mount
  const [viewport, setViewport] = useState<Viewport>({
    offsetX: 0,
    offsetY: 0,
    zoom: 1,
  });

  const isPanningRef = useRef(false);
  const lastPanPointRef = useRef<Point | null>(null);
  const [isPanning, setIsPanning] = useState(false);

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback(
    (screenX: number, screenY: number): Point => {
      return {
        x: (screenX - viewport.offsetX) / viewport.zoom,
        y: (screenY - viewport.offsetY) / viewport.zoom,
      };
    },
    [viewport]
  );

  // Handle wheel zoom (Ctrl+wheel) or pan (wheel without ctrl)
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();

    if (e.ctrlKey || e.metaKey) {
      // Zoom centered on mouse position
      const rect = e.currentTarget.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      setViewport(prev => {
        const zoomDelta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
        const newZoom = Math.min(
          MAX_ZOOM,
          Math.max(MIN_ZOOM, prev.zoom + zoomDelta)
        );
        const zoomRatio = newZoom / prev.zoom;

        // Adjust offset to zoom toward mouse position
        const newOffsetX = mouseX - (mouseX - prev.offsetX) * zoomRatio;
        const newOffsetY = mouseY - (mouseY - prev.offsetY) * zoomRatio;

        return {
          offsetX: newOffsetX,
          offsetY: newOffsetY,
          zoom: newZoom,
        };
      });
    } else {
      // Pan with wheel
      setViewport(prev => ({
        ...prev,
        offsetX: prev.offsetX - e.deltaX,
        offsetY: prev.offsetY - e.deltaY,
      }));
    }
  }, []);

  // Start panning
  const handlePanStart = useCallback((e: React.PointerEvent) => {
    isPanningRef.current = true;
    setIsPanning(true);
    lastPanPointRef.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  // Continue panning
  const handlePanMove = useCallback((e: React.PointerEvent) => {
    if (!isPanningRef.current || !lastPanPointRef.current) return;

    const dx = e.clientX - lastPanPointRef.current.x;
    const dy = e.clientY - lastPanPointRef.current.y;

    setViewport(prev => ({
      ...prev,
      offsetX: prev.offsetX + dx,
      offsetY: prev.offsetY + dy,
    }));

    lastPanPointRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  // End panning
  const handlePanEnd = useCallback(() => {
    isPanningRef.current = false;
    setIsPanning(false);
    lastPanPointRef.current = null;
  }, []);

  // Zoom controls
  const zoomIn = useCallback(() => {
    setViewport(prev => ({
      ...prev,
      zoom: Math.min(MAX_ZOOM, prev.zoom + ZOOM_STEP),
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setViewport(prev => ({
      ...prev,
      zoom: Math.max(MIN_ZOOM, prev.zoom - ZOOM_STEP),
    }));
  }, []);

  const resetView = useCallback(() => {
    setViewport({ offsetX: 0, offsetY: 0, zoom: 1 });
  }, []);

  return {
    viewport,
    setViewport,
    handleWheel,
    handlePanStart,
    handlePanMove,
    handlePanEnd,
    isPanning,
    zoomIn,
    zoomOut,
    resetView,
    screenToCanvas,
  };
};
