import { useEffect } from "react";

export interface ShortcutConfig {
  key: string;
  description: string;
  modifiers?: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
  };
}

export const SHORTCUTS: Record<string, ShortcutConfig> = {
  undo: {
    key: "z",
    description: "Undo last action",
    modifiers: { ctrl: true },
  },
  redo: {
    key: "z",
    description: "Redo last undone action",
    modifiers: { ctrl: true, shift: true },
  },
  rotate: {
    key: "r",
    description: "Rotate clockwise 90°",
  },
  rotateCounter: {
    key: "r",
    description: "Rotate counter-clockwise 90°",
    modifiers: { shift: true },
  },
  flipH: {
    key: "h",
    description: "Flip horizontally",
  },
  flipV: {
    key: "v",
    description: "Flip vertically",
  },
  crop: {
    key: "c",
    description: "Open crop tool",
  },
  export: {
    key: "e",
    description: "Export image",
    modifiers: { ctrl: true },
  },
  reset: {
    key: "0",
    description: "Reset all adjustments",
    modifiers: { ctrl: true },
  },
};

export interface UseKeyboardShortcutsProps {
  onUndo?: () => void;
  onRedo?: () => void;
  onRotate?: () => void;
  onRotateCounter?: () => void;
  onFlipH?: () => void;
  onFlipV?: () => void;
  onCrop?: () => void;
  onExport?: () => void;
  onReset?: () => void;
  enabled?: boolean;
}

/**
 * Hook to handle keyboard shortcuts for the image editor
 */
export function useKeyboardShortcuts({
  onUndo,
  onRedo,
  onRotate,
  onRotateCounter,
  onFlipH,
  onFlipV,
  onCrop,
  onExport,
  onReset,
  enabled = true,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey;
      const { shiftKey, altKey, key } = e;

      // Undo (Cmd/Ctrl + Z)
      if (ctrlKey && !shiftKey && key.toLowerCase() === "z") {
        e.preventDefault();
        onUndo?.();
        return;
      }

      // Redo (Cmd/Ctrl + Shift + Z)
      if (ctrlKey && shiftKey && key.toLowerCase() === "z") {
        e.preventDefault();
        onRedo?.();
        return;
      }

      // Export (Cmd/Ctrl + E)
      if (ctrlKey && key.toLowerCase() === "e") {
        e.preventDefault();
        onExport?.();
        return;
      }

      // Reset (Cmd/Ctrl + 0)
      if (ctrlKey && key === "0") {
        e.preventDefault();
        onReset?.();
        return;
      }

      // Don't handle other shortcuts if modifier keys are pressed
      if (ctrlKey || altKey) return;

      // Rotate counter-clockwise (Shift + R)
      if (shiftKey && key.toLowerCase() === "r") {
        e.preventDefault();
        onRotateCounter?.();
        return;
      }

      // Rotate clockwise (R)
      if (!shiftKey && key.toLowerCase() === "r") {
        e.preventDefault();
        onRotate?.();
        return;
      }

      // Flip horizontal (H)
      if (key.toLowerCase() === "h") {
        e.preventDefault();
        onFlipH?.();
        return;
      }

      // Flip vertical (V)
      if (key.toLowerCase() === "v") {
        e.preventDefault();
        onFlipV?.();
        return;
      }

      // Crop (C)
      if (key.toLowerCase() === "c") {
        e.preventDefault();
        onCrop?.();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    enabled,
    onUndo,
    onRedo,
    onRotate,
    onRotateCounter,
    onFlipH,
    onFlipV,
    onCrop,
    onExport,
    onReset,
  ]);
}
