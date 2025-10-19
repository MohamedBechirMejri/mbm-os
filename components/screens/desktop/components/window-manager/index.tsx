"use client";

export {
  closeWin,
  DesktopAPI,
  focusWin,
  launch,
  moveWin,
  registerApps,
  registerDockAppRect,
  restoreFromMinimized,
  setAnimationState,
  setWinState,
  snapTo,
  unsnap,
} from "./api";
export { __DevRegisterSampleApp, WindowManagerRoot } from "./components";
export { getDesktop, useDesktop } from "./store";
// Re-export a cleaner, modular Window Manager API
export * from "./types";
