import type React from "react";

export type AppId = string;

export interface AppMeta {
  id: AppId;
  title: string;
  icon?: React.ReactNode;
  Component: React.ComponentType<{ instanceId: string }>;
  minSize?: { w: number; h: number };
  maxSize?: { w: number; h: number };
  resizable?: boolean; // if false: hide resize handles and disable maximize/zoom
  floatingActionBar?: boolean; // if true: the app's action bar floats over content (like macOS Calculator)
  titlebarHeight?: number; // height of the titlebar in px, default is 36
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
  bounds: Bounds;
  // When maximizing/fullscreen, keep the last normal bounds to restore on unmaximize
  restoreBounds?: Bounds | null;
  z: number;
  focused: boolean;
  createdAt: number;
}

export interface DesktopState {
  apps: Record<AppId, AppMeta>;
  windows: Record<string, WinInstance>;
  order: string[];
  zCounter: number;
  activeId: string | null;
  dockByAppRect: Record<AppId, DOMRect | undefined>;
}
