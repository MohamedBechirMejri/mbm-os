import { useState, useCallback } from "react";
import type { HistoryEntry } from "../types";
import { MAX_HISTORY } from "../constants";

interface UseHistoryReturn {
  canUndo: boolean;
  canRedo: boolean;
  pushHistory: (layerId: string, canvas: HTMLCanvasElement) => void;
  undo: (canvasRefs: Map<string, HTMLCanvasElement>) => void;
  redo: (canvasRefs: Map<string, HTMLCanvasElement>) => void;
  clearHistory: () => void;
}

export const useHistory = (): UseHistoryReturn => {
  // Past states for undo
  const [undoStack, setUndoStack] = useState<HistoryEntry[]>([]);
  // Future states for redo
  const [redoStack, setRedoStack] = useState<HistoryEntry[]>([]);

  const canUndo = undoStack.length > 0;
  const canRedo = redoStack.length > 0;

  // Save current state before making changes
  const pushHistory = useCallback(
    (layerId: string, canvas: HTMLCanvasElement) => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      setUndoStack(prev => {
        const newStack = [...prev, { layerId, imageData }];
        // Limit history size
        if (newStack.length > MAX_HISTORY) {
          return newStack.slice(-MAX_HISTORY);
        }
        return newStack;
      });

      // Clear redo stack when new action is made
      setRedoStack([]);
    },
    []
  );

  // Restore previous state
  const undo = useCallback(
    (canvasRefs: Map<string, HTMLCanvasElement>) => {
      if (undoStack.length === 0) return;

      const lastEntry = undoStack[undoStack.length - 1];
      const canvas = canvasRefs.get(lastEntry.layerId);

      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Save current state to redo stack
      const currentImageData = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );
      setRedoStack(prev => [
        ...prev,
        { layerId: lastEntry.layerId, imageData: currentImageData },
      ]);

      // Restore the previous state
      ctx.putImageData(lastEntry.imageData, 0, 0);

      // Remove from undo stack
      setUndoStack(prev => prev.slice(0, -1));
    },
    [undoStack]
  );

  // Restore next state
  const redo = useCallback(
    (canvasRefs: Map<string, HTMLCanvasElement>) => {
      if (redoStack.length === 0) return;

      const lastEntry = redoStack[redoStack.length - 1];
      const canvas = canvasRefs.get(lastEntry.layerId);

      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Save current state to undo stack
      const currentImageData = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );
      setUndoStack(prev => [
        ...prev,
        { layerId: lastEntry.layerId, imageData: currentImageData },
      ]);

      // Restore the next state
      ctx.putImageData(lastEntry.imageData, 0, 0);

      // Remove from redo stack
      setRedoStack(prev => prev.slice(0, -1));
    },
    [redoStack]
  );

  // Clear all history
  const clearHistory = useCallback(() => {
    setUndoStack([]);
    setRedoStack([]);
  }, []);

  return {
    canUndo,
    canRedo,
    pushHistory,
    undo,
    redo,
    clearHistory,
  };
};
