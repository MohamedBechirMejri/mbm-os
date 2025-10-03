"use client";

import { useCallback } from "react";
import { DesktopAPI } from "../../window-manager";

export function useMenuActions() {
  const minimizeActiveWindow = useCallback(() => {
    const state = DesktopAPI.getState();
    if (state.activeId) {
      DesktopAPI.setState(state.activeId, "minimized");
    }
  }, []);

  const closeActiveWindow = useCallback(() => {
    const state = DesktopAPI.getState();
    if (state.activeId) {
      DesktopAPI.close(state.activeId);
    }
  }, []);

  const closeAllWindows = useCallback(() => {
    const state = DesktopAPI.getState();
    const windowIds = Object.keys(state.windows);
    for (const id of windowIds) {
      DesktopAPI.close(id);
    }
  }, []);

  const tileLeft = useCallback(() => {
    const state = DesktopAPI.getState();
    if (state.activeId) {
      DesktopAPI.snapTo(state.activeId, "left-half");
    }
  }, []);

  const tileRight = useCallback(() => {
    const state = DesktopAPI.getState();
    if (state.activeId) {
      DesktopAPI.snapTo(state.activeId, "right-half");
    }
  }, []);

  return {
    minimizeActiveWindow,
    closeActiveWindow,
    closeAllWindows,
    tileLeft,
    tileRight,
  };
}
