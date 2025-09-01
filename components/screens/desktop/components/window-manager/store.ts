"use client";

import { useEffect, useState } from "react";
import type { DesktopState } from "./types";

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
      return () => subs.delete(fn);
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

export const store = createStore<DesktopState>(initialState);

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
