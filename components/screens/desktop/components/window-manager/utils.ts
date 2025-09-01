"use client";

import type { Bounds, Snap, WinInstance } from "./types";

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function viewportRect(container: HTMLElement | null): DOMRect {
  if (!container) return new DOMRect(0, 0, window.innerWidth, window.innerHeight);
  return container.getBoundingClientRect();
}

export function cascadeOrigin(existing: WinInstance[], rootRect: DOMRect): Bounds {
  const size = {
    w: Math.round(Math.min(900, rootRect.width * 0.6)),
    h: Math.round(Math.min(700, rootRect.height * 0.6)),
  };
  const step = 28;
  const idx = existing.length % 8;
  const x = clamp(rootRect.x + step * idx + 40, 0, Math.max(0, rootRect.width - size.w));
  const y = clamp(rootRect.y + step * idx + 64, 0, Math.max(0, rootRect.height - size.h));
  return { x, y, w: size.w, h: size.h } satisfies Bounds;
}

export function computeSnapRect(snap: Snap, rootRect: DOMRect): Bounds {
  const W = rootRect.width;
  const H = rootRect.height;
  const x0 = 0;
  const y0 = 0;
  const halfW = Math.floor(W / 2);
  const halfH = Math.floor(H / 2);
  const qW = Math.floor(W / 2);
  const qH = Math.floor(H / 2);

  switch (snap) {
    case "left-half":
      return { x: x0, y: y0, w: halfW, h: H };
    case "right-half":
      return { x: x0 + W - halfW, y: y0, w: halfW, h: H };
    case "top-half":
      return { x: x0, y: y0, w: W, h: halfH };
    case "bottom-half":
      return { x: x0, y: y0 + H - halfH, w: W, h: halfH };
    case "tl-quarter":
      return { x: x0, y: y0, w: qW, h: qH };
    case "tr-quarter":
      return { x: x0 + W - qW, y: y0, w: qW, h: qH };
    case "bl-quarter":
      return { x: x0, y: y0 + H - qH, w: qW, h: qH };
    case "br-quarter":
      return { x: x0 + W - qW, y: y0 + H - qH, w: qW, h: qH };
    default:
      return { x: 80, y: 80, w: Math.floor(W * 0.6), h: Math.floor(H * 0.6) };
  }
}

export function near(a: number, b: number, threshold = 16) {
  return Math.abs(a - b) <= threshold;
}

