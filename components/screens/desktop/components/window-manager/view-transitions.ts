"use client";

import type { WinInstance } from "./types";

export type WindowTransitionKind = "minimize" | "restore";

interface WindowTransitionOptions {
  win: WinInstance;
  kind: WindowTransitionKind;
  commit: () => void;
  onFinished?: () => void;
}

const activeWindowTransitions = new Set<string>();
const ROOT_CLASS = "wm-view-transition-active";

function getKindClass(kind: WindowTransitionKind) {
  return `wm-view-transition-${kind}`;
}

function cleanupTransitionNames(targets: Iterable<HTMLElement>) {
  for (const el of targets) {
    el.style.removeProperty("view-transition-name");
    el.classList.remove("wm-dock-transition-target");
  }
}

export function isViewTransitionSupported(): boolean {
  return typeof document !== "undefined" && !!document.startViewTransition;
}

export function isWindowTransitionActive(id: string): boolean {
  return activeWindowTransitions.has(id);
}

export function runWindowViewTransition(
  options: WindowTransitionOptions,
): boolean {
  // Genie minimize/restore relies on motion-based animation; bail out to let that run.
  if (options.kind === "minimize" || options.kind === "restore") {
    return false;
  }
  if (!isViewTransitionSupported()) return false;
  const { win, kind, commit, onFinished } = options;
  const doc = document;
  if (!doc.startViewTransition) return false;

  const root = document.getElementById("wm-root");
  if (!root) return false;

  const winEl = root.querySelector<HTMLElement>(`[data-win-id="${win.id}"]`);
  if (!winEl) return false;

  const cleanupTargets = new Set<HTMLElement>();
  const register = (el: HTMLElement | null | undefined, name: string) => {
    if (!el) return;
    cleanupTargets.add(el);
    el.style.setProperty("view-transition-name", name);
  };

  register(winEl, `wm-window-${win.id}`);

  const dockEl = document.querySelector<HTMLElement>(
    `[data-dock-app="${win.appId}"]`,
  );
  if (dockEl) {
    dockEl.classList.add("wm-dock-transition-target");
    register(dockEl, `wm-dock-${win.appId}`);
  }

  const kindClass = getKindClass(kind);
  document.documentElement.classList.add(ROOT_CLASS, kindClass);
  activeWindowTransitions.add(win.id);

  try {
    const transition = doc.startViewTransition(async () => {
      commit();
    });

    transition.finished
      .catch(() => undefined)
      .finally(() => {
        cleanupTransitionNames(cleanupTargets);
        document.documentElement.classList.remove(ROOT_CLASS, kindClass);
        activeWindowTransitions.delete(win.id);
        onFinished?.();
      });

    return true;
  } catch {
    cleanupTransitionNames(cleanupTargets);
    document.documentElement.classList.remove(ROOT_CLASS, kindClass);
    activeWindowTransitions.delete(win.id);
    return false;
  }
}
export type { WindowTransitionOptions };
