"use client";

import { useCallback, useRef, useState } from "react";
import { focusWin, moveWin } from "./api";
import { useDesktop } from "./store";
import type { Bounds, WinInstance } from "./types";
import { clamp } from "./utils";

export function useWindowDrag(
  win: WinInstance,
  _rootRef: React.RefObject<HTMLDivElement | null>,
) {
  const [dragging, setDragging] = useState(false);
  const startRef = useRef<{ x: number; y: number; bounds: Bounds } | null>(
    null,
  );
  const rafRef = useRef<number | null>(null);
  const pendingRef = useRef<{ x: number; y: number } | null>(null);

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
      pendingRef.current = next;
      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = null;
          const p = pendingRef.current;
          if (p) moveWin(win.id, p);
        });
      }
    },
    [dragging, win.id],
  );

  const onPointerUp = useCallback((_e: React.PointerEvent) => {
    // Drag-to-edge snapping disabled: simply end dragging without applying a snap state.
    setDragging(false);
    pendingRef.current = null;
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  return { dragging, onPointerDown, onPointerMove, onPointerUp } as const;
}

export function useWindowResize(
  win: WinInstance,
  _rootRef: React.RefObject<HTMLDivElement | null>,
) {
  // Get app meta to know min/max constraints
  const meta = useDesktop((s) => s.apps[win.appId]);
  const minW = meta?.minSize?.w ?? 200;
  const minH = meta?.minSize?.h ?? 140;
  const maxW = meta?.maxSize?.w ?? Number.POSITIVE_INFINITY;
  const maxH = meta?.maxSize?.h ?? Number.POSITIVE_INFINITY;

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

      const startRight = start.bounds.x + start.bounds.w;
      const startBottom = start.bounds.y + start.bounds.h;

      let x = start.bounds.x;
      let y = start.bounds.y;
      let w = start.bounds.w;
      let h = start.bounds.h;

      // Horizontal resize
      if (edge.includes("l")) {
        // Left edge: right stays fixed; adjust width and recompute x
        const newW = clamp(start.bounds.w - dx, minW, maxW);
        w = newW;
        x = startRight - newW;
      } else if (edge.includes("r")) {
        // Right edge: left stays fixed
        w = clamp(start.bounds.w + dx, minW, maxW);
      }

      // Vertical resize
      if (edge.includes("t")) {
        const newH = clamp(start.bounds.h - dy, minH, maxH);
        h = newH;
        y = startBottom - newH;
      } else if (edge.includes("b")) {
        h = clamp(start.bounds.h + dy, minH, maxH);
      }

      moveWin(win.id, { x, y, w, h });
    },
    [resizing, win.id, minW, minH, maxW, maxH],
  );

  const onPointerUp = useCallback(() => setResizing(null), []);

  return {
    resizing: !!resizing,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  } as const;
}
