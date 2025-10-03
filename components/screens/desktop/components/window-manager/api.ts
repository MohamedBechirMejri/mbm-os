"use client";

import { getDesktop, store } from "./store";
import type {
  AppId,
  AppMeta,
  Bounds,
  Snap,
  WinInstance,
  WinState,
} from "./types";
import {
  MENU_BAR_HEIGHT,
  cascadeOrigin,
  computeSnapRect,
  viewportRect,
} from "./utils";

export function registerApps(apps: AppMeta[]) {
  store.set((s) => ({
    ...s,
    apps: { ...s.apps, ...Object.fromEntries(apps.map((a) => [a.id, a])) },
  }));
}

export function registerDockAppRect(appId: AppId, rect?: DOMRect) {
  store.set((s) => ({
    ...s,
    dockByAppRect: { ...s.dockByAppRect, [appId]: rect },
  }));
}

export function launch(appId: AppId, init?: Partial<WinInstance>): string {
  const s = store.get();
  const meta = s.apps[appId];
  if (!meta) throw new Error(`App not registered: ${appId}`);
  const id = crypto.randomUUID();
  const now = Date.now();
  const z = s.zCounter + 1;
  const root = document.getElementById("wm-root");
  const rootRect = viewportRect(root);
  const existing = Object.values(s.windows);
  let bounds = init?.bounds ?? cascadeOrigin(existing, rootRect);
  // Enforce min/max at launch
  if (meta.minSize || meta.maxSize) {
    const minW = meta.minSize?.w ?? 0;
    const minH = meta.minSize?.h ?? 0;
    const maxW = meta.maxSize?.w ?? Number.POSITIVE_INFINITY;
    const maxH = meta.maxSize?.h ?? Number.POSITIVE_INFINITY;
    bounds = {
      ...bounds,
      w: Math.min(Math.max(bounds.w, minW), maxW),
      h: Math.min(Math.max(bounds.h, minH), maxH),
    };
  }
  const w: WinInstance = {
    id,
    appId,
    title: init?.title ?? meta.title ?? appId,
    state: init?.state ?? "normal",
    snap: init?.snap ?? null,
    bounds,
    z,
    focused: true,
    createdAt: now,
  };
  store.set((prev) => ({
    ...prev,
    zCounter: z,
    windows: { ...prev.windows, [id]: w },
    order: [id, ...prev.order.filter((x) => x !== id)],
    activeId: id,
  }));
  return id;
}

export function focusWin(id: string) {
  const s = store.get();
  const w = s.windows[id];
  if (!w) return;
  const z = s.zCounter + 1;
  store.set((prev) => ({
    ...prev,
    zCounter: z,
    windows: { ...prev.windows, [id]: { ...w, z, focused: true } },
    order: [id, ...prev.order.filter((x) => x !== id)],
    activeId: id,
  }));
}

export function setWinState(id: string, st: WinState) {
  const s = store.get();
  const w = s.windows[id];
  if (!w) return;
  const meta = s.apps[w.appId];
  // If the app is non-resizable, disallow maximize/fullscreen transitions
  if (
    meta &&
    meta.resizable === false &&
    (st === "maximized" || st === "fullscreen")
  ) {
    return;
  }
  const minW = meta?.minSize?.w ?? 0;
  const minH = meta?.minSize?.h ?? 0;
  const maxW = meta?.maxSize?.w ?? Number.POSITIVE_INFINITY;
  const maxH = meta?.maxSize?.h ?? Number.POSITIVE_INFINITY;

  const root = document.getElementById("wm-root");
  const r = viewportRect(root);

  let next: WinInstance = { ...w } as WinInstance;

  if (st === "maximized" || st === "fullscreen") {
    // Save current bounds to restore later (only overwrite when coming from normal)
    const restoreBounds =
      w.state === "normal" ? w.bounds : (w.restoreBounds ?? w.bounds);
    next = {
      ...next,
      state: st,
      snap: null,
      restoreBounds,
      bounds: (() => {
        const b =
          st === "maximized"
            ? {
                x: 0,
                y: MENU_BAR_HEIGHT,
                w: r.width,
                h: r.height - MENU_BAR_HEIGHT,
              }
            : { x: 0, y: 0, w: window.innerWidth, h: window.innerHeight };
        return {
          ...b,
          w: Math.min(Math.max(b.w, minW), maxW),
          h: Math.min(Math.max(b.h, minH), maxH),
        } as Bounds;
      })(),
    };
  } else if (st === "normal") {
    // Restore previous bounds when unmaximizing/unfullscreening
    const rb = w.restoreBounds ?? w.bounds;
    next = {
      ...next,
      state: "normal",
      snap: w.snap,
      bounds: {
        ...rb,
        w: Math.min(Math.max(rb.w, minW), maxW),
        h: Math.min(Math.max(rb.h, minH), maxH),
      },
      restoreBounds: null,
    };
  } else {
    // Other states (minimized/hidden) — pass through without changing bounds
    next = { ...next, state: st, snap: null } as WinInstance;
  }

  store.set((prev) => ({ ...prev, windows: { ...prev.windows, [id]: next } }));
}

export function closeWin(id: string) {
  store.set((prev) => {
    const { [id]: _dead, ...rest } = prev.windows;
    return {
      ...prev,
      windows: rest,
      order: prev.order.filter((x) => x !== id),
      activeId: prev.activeId === id ? null : prev.activeId,
    };
  });
}

export function moveWin(id: string, to: Partial<Bounds>) {
  const s = store.get();
  const w = s.windows[id];
  if (!w) return;
  const meta = s.apps[w.appId];
  const minW = meta?.minSize?.w ?? 0;
  const minH = meta?.minSize?.h ?? 0;
  const maxW = meta?.maxSize?.w ?? Number.POSITIVE_INFINITY;
  const maxH = meta?.maxSize?.h ?? Number.POSITIVE_INFINITY;
  const merged = { ...w.bounds, ...to } as Bounds;
  const clamped: Bounds = {
    ...merged,
    w: Math.min(Math.max(merged.w, minW), maxW),
    h: Math.min(Math.max(merged.h, minH), maxH),
  };
  // If width/height were clamped and left/top edges were being dragged, adjust x/y accordingly
  const next = { ...w, bounds: clamped } as WinInstance;
  store.set((prev) => ({ ...prev, windows: { ...prev.windows, [id]: next } }));
}

export function snapTo(id: string, snap: Snap) {
  const root = document.getElementById("wm-root");
  const r = viewportRect(root);
  const rect = computeSnapRect(snap, r);
  store.set((prev) => {
    const w = prev.windows[id];
    if (!w) return prev;
    const meta = prev.apps[w.appId];
    const minW = meta?.minSize?.w ?? 0;
    const minH = meta?.minSize?.h ?? 0;
    const maxW = meta?.maxSize?.w ?? Number.POSITIVE_INFINITY;
    const maxH = meta?.maxSize?.h ?? Number.POSITIVE_INFINITY;
    const clamped: Bounds = {
      ...rect,
      w: Math.min(Math.max(rect.w, minW), maxW),
      h: Math.min(Math.max(rect.h, minH), maxH),
    };
    return {
      ...prev,
      windows: {
        ...prev.windows,
        [id]: { ...w, snap, state: "normal", bounds: clamped },
      },
    };
  });
}

export function unsnap(id: string) {
  store.set((prev) => {
    const w = prev.windows[id];
    if (!w) return prev;
    return {
      ...prev,
      windows: { ...prev.windows, [id]: { ...w, snap: null } },
    };
  });
}

export const DesktopAPI = {
  getState: getDesktop,
  registerApps,
  registerDockAppRect,
  launch,
  focus: focusWin,
  setState: setWinState,
  close: closeWin,
  move: moveWin,
  snapTo,
  unsnap,
};
