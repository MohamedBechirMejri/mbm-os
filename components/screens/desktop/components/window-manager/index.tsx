"use client";

// Window Manager v0.1 (self‑contained)
// - No external deps
// - Registry + instances + minimal drag/resize/snap/min/max/fullscreen
// - Exported actions so your Dock and apps can interact without importing React internals
// Cleanup later: split types, actions, and components into separate files if you want.

import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/*********************************
 * Types
 *********************************/
export type AppId = string;

export interface AppMeta {
  id: AppId;
  title: string;
  icon?: React.ReactNode; // keep it loose; you can swap to a string enum later
  Component: React.ComponentType<{ instanceId: string }>;
  minSize?: { w: number; h: number };
  maxSize?: { w: number; h: number };
}

export type WinState =
  | "normal"
  | "minimized"
  | "maximized"
  | "fullscreen"
  | "hidden";
export type Snap =
  | null
  | "left-half"
  | "right-half"
  | "top-half"
  | "bottom-half"
  | "tl-quarter"
  | "tr-quarter"
  | "bl-quarter"
  | "br-quarter";

export interface Bounds {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WinInstance {
  id: string;
  appId: AppId;
  title: string;
  state: WinState;
  snap: Snap;
  bounds: Bounds; // last concrete rect (in pixels) for "normal"
  z: number;
  focused: boolean;
  createdAt: number;
}

export interface DesktopState {
  apps: Record<AppId, AppMeta>;
  windows: Record<string, WinInstance>;
  order: string[]; // MRU stack (0 is top/focused)
  zCounter: number;
  activeId: string | null;
  dockByAppRect: Record<AppId, DOMRect | undefined>;
}

/*********************************
 * Tiny store (no Zustand)
 *********************************/

type Listener = () => void;

const createStore = <T extends object>(initial: T) => {
  let state = initial;
  const subs = new Set<Listener>();
  return {
    get: () => state,
    set: (updater: (s: T) => T) => {
      state = updater(state);
      subs.forEach((l) => {
        l();
      });
    },
    subscribe: (fn: Listener) => {
      subs.add(fn);
      return () => {
        subs.delete(fn);
      };
    },
  };
};

const initialState: DesktopState = {
  apps: {},
  windows: {},
  order: [],
  zCounter: 1,
  activeId: null,
  dockByAppRect: {},
};

const store = createStore<DesktopState>(initialState);

/*********************************
 * Selectors and subscription hook
 *********************************/

export function useDesktop<T>(selector: (s: DesktopState) => T): T {
  const [sel, setSel] = useState(() => selector(store.get()));
  useEffect(() => {
    const unsub = store.subscribe(() => setSel(selector(store.get())));
    return () => {
      unsub();
    };
  }, [selector]);
  return sel;
}

export function getDesktop(): DesktopState {
  return store.get();
}

/*********************************
 * Helpers
 *********************************/

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function viewportRect(container: HTMLElement | null): DOMRect {
  if (!container)
    return new DOMRect(0, 0, window.innerWidth, window.innerHeight);
  return container.getBoundingClientRect();
}

function cascadeOrigin(existing: WinInstance[], rootRect: DOMRect) {
  const size = {
    w: Math.round(Math.min(900, rootRect.width * 0.6)),
    h: Math.round(Math.min(700, rootRect.height * 0.6)),
  };
  const step = 28;
  const idx = existing.length % 8;
  const x = clamp(
    rootRect.x + step * idx + 40,
    0,
    Math.max(0, rootRect.width - size.w),
  );
  const y = clamp(
    rootRect.y + step * idx + 64,
    0,
    Math.max(0, rootRect.height - size.h),
  );
  return { x, y, w: size.w, h: size.h } satisfies Bounds;
}

function computeSnapRect(snap: Snap, rootRect: DOMRect): Bounds {
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

function near(a: number, b: number, threshold = 16) {
  return Math.abs(a - b) <= threshold;
}

/*********************************
 * Public API (actions)
 *********************************/

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
  const bounds = init?.bounds ?? cascadeOrigin(existing, rootRect);
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
  const next = {
    ...w,
    state: st,
    snap: st !== "normal" ? null : w.snap,
  } as WinInstance;
  const root = document.getElementById("wm-root");
  const r = viewportRect(root);
  if (st === "maximized") next.bounds = { x: 0, y: 0, w: r.width, h: r.height };
  if (st === "fullscreen")
    next.bounds = { x: 0, y: 0, w: window.innerWidth, h: window.innerHeight };
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
  const next = { ...w, bounds: { ...w.bounds, ...to } } as WinInstance;
  store.set((prev) => ({ ...prev, windows: { ...prev.windows, [id]: next } }));
}

export function snapTo(id: string, snap: Snap) {
  const root = document.getElementById("wm-root");
  const r = viewportRect(root);
  const rect = computeSnapRect(snap, r);
  store.set((prev) => {
    const w = prev.windows[id];
    if (!w) return prev;
    return {
      ...prev,
      windows: {
        ...prev.windows,
        [id]: { ...w, snap, state: "normal", bounds: rect },
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

/*********************************
 * Components
 *********************************/

// Public root. Give it full area of your desktop.
export function WindowManagerRoot({ className }: { className?: string }) {
  // Keep a ref so we can compute snapping against this container
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.id = "wm-root"; // used by actions
  }, []);

  const ids = useDesktop((s) => s.order);
  const windows = useDesktop((s) => s.windows);

  return (
    <div
      ref={ref}
      className={className}
      style={{ position: "absolute", inset: 0, overflow: "hidden" }}
    >
      {ids.map((id) => {
        const w = windows[id];
        if (!w || w.state === "minimized" || w.state === "hidden") return null;
        return <WindowView key={id} win={w} rootRef={ref} />;
      })}
    </div>
  );
}

function useWindowDrag(
  win: WinInstance,
  rootRef: React.RefObject<HTMLDivElement | null>,
) {
  const [dragging, setDragging] = useState(false);
  const startRef = useRef<{ x: number; y: number; bounds: Bounds } | null>(
    null,
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if ((e.target as HTMLElement).closest(".wm-resize-handle")) return; // ignore if resize handle
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

  const onPointerUp = useCallback(
    (_e: React.PointerEvent) => {
      if (!dragging || !rootRef.current) return setDragging(false);
      const rootRect = viewportRect(rootRef.current);
      const { x, y, w, h } = store.get().windows[win.id].bounds;

      // Snap preview on edges/corners
      let applied: Snap | null = null;
      if (near(x, 0) && near(y, 0)) applied = "tl-quarter";
      else if (near(x + w, rootRect.width) && near(y, 0))
        applied = "tr-quarter";
      else if (near(x, 0) && near(y + h, rootRect.height))
        applied = "bl-quarter";
      else if (near(x + w, rootRect.width) && near(y + h, rootRect.height))
        applied = "br-quarter";
      else if (near(x, 0)) applied = "left-half";
      else if (near(x + w, rootRect.width)) applied = "right-half";
      else if (near(y, 0)) applied = "top-half";
      else if (near(y + h, rootRect.height)) applied = "bottom-half";

      if (applied) snapTo(win.id, applied);

      setDragging(false);
    },
    [dragging, win.id, rootRef.current],
  );

  return { dragging, onPointerDown, onPointerMove, onPointerUp } as const;
}

function useWindowResize(
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

function WindowView({
  win,
  rootRef,
}: {
  win: WinInstance;
  rootRef: React.RefObject<HTMLDivElement | null>;
}) {
  const meta = useDesktop((s) => s.apps[win.appId]);

  const drag = useWindowDrag(win, rootRef);
  const resize = useWindowResize(win, rootRef);

  const style: React.CSSProperties = {
    position: "absolute",
    left: 0,
    top: 0,
    transform: `translate3d(${win.bounds.x}px, ${win.bounds.y}px, 0)`,
    width: win.bounds.w,
    height: win.bounds.h,
    zIndex: win.z,
    borderRadius: 12,
    overflow: "hidden",
    // Placeholder glass: you will replace with your Tahoe liquid-glass implementation
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.18)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    boxShadow: win.focused
      ? "0 10px 32px rgba(0,0,0,0.45)"
      : "0 10px 28px rgba(0,0,0,0.28)",
    outline: win.focused
      ? "1px solid rgba(255,255,255,0.25)"
      : "1px solid rgba(255,255,255,0.12)",
    userSelect: "none",
  };

  const onTitleDoubleClick = () => {
    setWinState(win.id, win.state === "maximized" ? "normal" : "maximized");
  };

  return (
    <div
      className="wm-window"
      style={style}
      onPointerDown={() => focusWin(win.id)}
    >
      {/* Titlebar */}
      <div
        className="wm-titlebar"
        onPointerDown={drag.onPointerDown}
        onPointerMove={drag.onPointerMove}
        onPointerUp={drag.onPointerUp}
        onDoubleClick={onTitleDoubleClick}
        role="toolbar"
        aria-label="Window title bar"
        style={{
          height: 36,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 10px",
          cursor: "grab",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06))",
          borderBottom: "1px solid rgba(255,255,255,0.14)",
        }}
      >
        {/* traffic lights */}
        <div style={{ display: "flex", gap: 8, paddingRight: 6 }}>
          <button
            type="button"
            aria-label="Close"
            onClick={(e) => {
              e.stopPropagation();
              closeWin(win.id);
            }}
            style={circleBtn("#ff5f57")}
          />
          <button
            type="button"
            aria-label="Minimize"
            onClick={(e) => {
              e.stopPropagation();
              setWinState(win.id, "minimized");
            }}
            style={circleBtn("#ffbd2e")}
          />
          <button
            type="button"
            aria-label="Zoom"
            onClick={(e) => {
              e.stopPropagation();
              setWinState(
                win.id,
                win.state === "maximized" ? "normal" : "maximized",
              );
            }}
            style={circleBtn("#28c840")}
          />
        </div>
        <div style={{ fontSize: 12, opacity: 0.85 }}>{win.title}</div>
      </div>

      {/* Content area */}
      <div
        className="wm-content"
        style={{ position: "absolute", inset: 36, overflow: "auto" }}
      >
        {meta ? <meta.Component instanceId={win.id} /> : null}
      </div>

      {/* Resize handles */}
      {(["t", "r", "b", "l", "tr", "br", "bl", "tl"] as const).map((edge) => (
        <div
          key={edge}
          className="wm-resize-handle"
          onPointerDown={resize.onPointerDown(edge)}
          onPointerMove={resize.onPointerMove}
          onPointerUp={resize.onPointerUp}
          style={resizeHandleStyle(edge)}
        />
      ))}
    </div>
  );
}

function circleBtn(color: string): React.CSSProperties {
  return {
    width: 12,
    height: 12,
    borderRadius: 9999,
    background: color,
    border: "1px solid rgba(0,0,0,0.15)",
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.35)",
    cursor: "pointer",
  };
}

function resizeHandleStyle(
  edge: "t" | "r" | "b" | "l" | "tr" | "br" | "bl" | "tl",
): React.CSSProperties {
  const base: React.CSSProperties = { position: "absolute", zIndex: 2 };
  const size = 8; // invisible fat handles for easier grabbing
  switch (edge) {
    case "t":
      return {
        ...base,
        top: -2,
        left: 8,
        right: 8,
        height: size,
        cursor: "ns-resize",
      };
    case "b":
      return {
        ...base,
        bottom: -2,
        left: 8,
        right: 8,
        height: size,
        cursor: "ns-resize",
      };
    case "l":
      return {
        ...base,
        left: -2,
        top: 8,
        bottom: 8,
        width: size,
        cursor: "ew-resize",
      };
    case "r":
      return {
        ...base,
        right: -2,
        top: 8,
        bottom: 8,
        width: size,
        cursor: "ew-resize",
      };
    case "tr":
      return {
        ...base,
        right: -2,
        top: -2,
        width: size,
        height: size,
        cursor: "nesw-resize",
      };
    case "br":
      return {
        ...base,
        right: -2,
        bottom: -2,
        width: size,
        height: size,
        cursor: "nwse-resize",
      };
    case "bl":
      return {
        ...base,
        left: -2,
        bottom: -2,
        width: size,
        height: size,
        cursor: "nesw-resize",
      };
    case "tl":
      return {
        ...base,
        left: -2,
        top: -2,
        width: size,
        height: size,
        cursor: "nwse-resize",
      };
  }
}

/*********************************
 * Convenience exports for your Dock
 *********************************/

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

// Optional: throw in a very tiny demo App so the file is testable if you mount it alone.
export function __DevRegisterSampleApp() {
  const Demo = useMemo(
    () =>
      function Demo({ instanceId }: { instanceId: string }) {
        return (
          <div style={{ padding: 16, color: "white" }}>
            <p style={{ margin: 0, fontWeight: 600 }}>Demo App</p>
            <p style={{ marginTop: 6, opacity: 0.8 }}>Instance: {instanceId}</p>
            <p style={{ marginTop: 10, opacity: 0.7 }}>
              Replace this with your actual apps. This component exists so you
              can see a window render before wiring your registry.
            </p>
          </div>
        );
      },
    [],
  );

  useEffect(() => {
    registerApps([{ id: "demo", title: "Demo", Component: Demo }]);
  }, [Demo]);

  return null;
}

/* Usage sketch elsewhere:

import { WindowManagerRoot, DesktopAPI } from "./components/window-manager";

function Desktop() {
  return (
    <>
      <WindowManagerRoot />
      <YourDock ... onIconClick={() => DesktopAPI.launch("notes")} />
    </>
  );
}

*/
