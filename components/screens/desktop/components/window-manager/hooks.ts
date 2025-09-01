"use client";

import { useCallback, useRef, useState } from "react";
import { focusWin, moveWin } from "./api";
import type { Bounds, WinInstance } from "./types";

export function useWindowDrag(
  win: WinInstance,
  _rootRef: React.RefObject<HTMLDivElement | null>,
) {
  const [dragging, setDragging] = useState(false);
  const startRef = useRef<{ x: number; y: number; bounds: Bounds } | null>(
    null,
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if ((e.target as HTMLElement).closest(".wm-resize-handle")) return;
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      startRef.current = {
        x: e.clientX,
        y: e.clientY,
        bounds: { ...win.bounds },
      };
      setDragging(true);
      focusWin(win.id);
    },
    [win.id, win.bounds],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging || !startRef.current) return;
      const dx = e.clientX - startRef.current.x;
      const dy = e.clientY - startRef.current.y;
      const next = {
        x: startRef.current.bounds.x + dx,
        y: startRef.current.bounds.y + dy,
      };
      moveWin(win.id, next);
    },
    [dragging, win.id],
  );

  const onPointerUp = useCallback((_e: React.PointerEvent) => {
    // Drag-to-edge snapping disabled: simply end dragging without applying a snap state.
    setDragging(false);
  }, []);

  return { dragging, onPointerDown, onPointerMove, onPointerUp } as const;
}

export function useWindowResize(
  win: WinInstance,
  _rootRef: React.RefObject<HTMLDivElement | null>,
) {
  const [resizing, setResizing] = useState<null | {
    edge: string;
    start: { x: number; y: number; bounds: Bounds };
  }>(null);

  const onPointerDown = useCallback(
    (edge: string) => (e: React.PointerEvent) => {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      setResizing({
        edge,
        start: { x: e.clientX, y: e.clientY, bounds: { ...win.bounds } },
      });
      focusWin(win.id);
    },
    [win.id, win.bounds],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!resizing) return;
      const { edge, start } = resizing;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      let { x, y, w, h } = start.bounds;

      if (edge.includes("r")) w = Math.max(200, w + dx);
      if (edge.includes("l")) {
        x = x + dx;
        w = Math.max(200, w - dx);
      }
      if (edge.includes("b")) h = Math.max(140, h + dy);
      if (edge.includes("t")) {
        y = y + dy;
        h = Math.max(140, h - dy);
      }

      moveWin(win.id, { x, y, w, h });
    },
    [resizing, win.id],
  );

  const onPointerUp = useCallback(() => setResizing(null), []);

  return {
    resizing: !!resizing,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  } as const;
}
