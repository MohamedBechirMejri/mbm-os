import { useCallback, useRef, useState } from "react";
import { MAX_HISTORY } from "../constants";
import type { Point, Stroke, StrokeHistoryEntry } from "../types";

// Generate a unique stroke ID
const generateStrokeId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

// Calculate distance from a point to a line segment
const pointToSegmentDistance = (
  point: Point,
  segStart: Point,
  segEnd: Point
): number => {
  const dx = segEnd.x - segStart.x;
  const dy = segEnd.y - segStart.y;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    // Segment is a point
    return Math.sqrt((point.x - segStart.x) ** 2 + (point.y - segStart.y) ** 2);
  }

  // Project point onto the line, clamping to segment
  let t =
    ((point.x - segStart.x) * dx + (point.y - segStart.y) * dy) / lengthSquared;
  t = Math.max(0, Math.min(1, t));

  const projX = segStart.x + t * dx;
  const projY = segStart.y + t * dy;

  return Math.sqrt((point.x - projX) ** 2 + (point.y - projY) ** 2);
};

// Check if a point is close enough to a stroke to hit it
const isPointOnStroke = (
  point: Point,
  stroke: Stroke,
  threshold: number
): boolean => {
  // Use stroke size + threshold for hit detection
  const hitRadius = stroke.size / 2 + threshold;

  for (let i = 0; i < stroke.points.length - 1; i++) {
    const distance = pointToSegmentDistance(
      point,
      stroke.points[i],
      stroke.points[i + 1]
    );
    if (distance <= hitRadius) {
      return true;
    }
  }

  // Also check the last point (for single-point strokes)
  if (stroke.points.length === 1) {
    const dx = point.x - stroke.points[0].x;
    const dy = point.y - stroke.points[0].y;
    return Math.sqrt(dx * dx + dy * dy) <= hitRadius;
  }

  return false;
};

interface UseStrokesReturn {
  strokes: Stroke[];
  currentStroke: Stroke | null;
  startStroke: (
    layerId: string,
    point: Point,
    size: number,
    color: string
  ) => void;
  addPointToStroke: (point: Point) => void;
  endStroke: () => void;
  deleteStrokesAtPoint: (
    point: Point,
    layerId: string,
    threshold?: number
  ) => Stroke[];
  commitEraseBatch: () => void;
  getStrokesForLayer: (layerId: string) => Stroke[];
  clearLayerStrokes: (layerId: string) => Stroke[];
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  setStrokes: React.Dispatch<React.SetStateAction<Stroke[]>>;
}

export const useStrokes = (): UseStrokesReturn => {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);

  // History for undo/redo
  const [undoStack, setUndoStack] = useState<StrokeHistoryEntry[]>([]);
  const [redoStack, setRedoStack] = useState<StrokeHistoryEntry[]>([]);

  // Track strokes deleted in current erase operation for batching
  const eraseBatchRef = useRef<Stroke[]>([]);

  const canUndo = undoStack.length > 0;
  const canRedo = redoStack.length > 0;

  // Start a new stroke
  const startStroke = useCallback(
    (layerId: string, point: Point, size: number, color: string) => {
      const newStroke: Stroke = {
        id: generateStrokeId(),
        points: [point],
        size,
        color,
        layerId,
      };
      setCurrentStroke(newStroke);
    },
    []
  );

  // Add a point to the current stroke
  const addPointToStroke = useCallback((point: Point) => {
    setCurrentStroke(prev => {
      if (!prev) return null;
      return {
        ...prev,
        points: [...prev.points, point],
      };
    });
  }, []);

  // End the current stroke and add it to the strokes array
  const endStroke = useCallback(() => {
    setCurrentStroke(prev => {
      if (prev && prev.points.length > 0) {
        setStrokes(strokes => [...strokes, prev]);
        // Add to history
        setUndoStack(history => {
          const newEntry: StrokeHistoryEntry = { type: "add", strokes: [prev] };
          const newStack = [...history, newEntry];
          if (newStack.length > MAX_HISTORY) {
            return newStack.slice(-MAX_HISTORY);
          }
          return newStack;
        });
        setRedoStack([]);
      }
      return null;
    });
  }, []);

  // Delete all strokes that the point touches and return deleted strokes
  const deleteStrokesAtPoint = useCallback(
    (point: Point, layerId: string, threshold = 5): Stroke[] => {
      const deletedStrokes: Stroke[] = [];

      setStrokes(prev => {
        const remaining: Stroke[] = [];
        for (const stroke of prev) {
          // Only check strokes on the same layer
          if (
            stroke.layerId === layerId &&
            isPointOnStroke(point, stroke, threshold)
          ) {
            deletedStrokes.push(stroke);
          } else {
            remaining.push(stroke);
          }
        }
        return remaining;
      });

      // Batch deleted strokes for history
      if (deletedStrokes.length > 0) {
        eraseBatchRef.current = [...eraseBatchRef.current, ...deletedStrokes];
      }

      return deletedStrokes;
    },
    []
  );

  // Commit the erase batch to history (call when erasing ends)
  const commitEraseBatch = useCallback(() => {
    if (eraseBatchRef.current.length > 0) {
      setUndoStack(history => {
        const newEntry: StrokeHistoryEntry = {
          type: "delete",
          strokes: eraseBatchRef.current,
        };
        const newStack = [...history, newEntry];
        if (newStack.length > MAX_HISTORY) {
          return newStack.slice(-MAX_HISTORY);
        }
        return newStack;
      });
      setRedoStack([]);
      eraseBatchRef.current = [];
    }
  }, []);

  // Get strokes for a specific layer
  const getStrokesForLayer = useCallback(
    (layerId: string): Stroke[] => {
      return strokes.filter(s => s.layerId === layerId);
    },
    [strokes]
  );

  // Clear all strokes on a layer
  const clearLayerStrokes = useCallback((layerId: string): Stroke[] => {
    let clearedStrokes: Stroke[] = [];

    setStrokes(prev => {
      clearedStrokes = prev.filter(s => s.layerId === layerId);
      return prev.filter(s => s.layerId !== layerId);
    });

    if (clearedStrokes.length > 0) {
      setUndoStack(history => {
        const newEntry: StrokeHistoryEntry = {
          type: "delete",
          strokes: clearedStrokes,
        };
        const newStack = [...history, newEntry];
        if (newStack.length > MAX_HISTORY) {
          return newStack.slice(-MAX_HISTORY);
        }
        return newStack;
      });
      setRedoStack([]);
    }

    return clearedStrokes;
  }, []);

  // Undo last action
  const undo = useCallback(() => {
    if (undoStack.length === 0) return;

    const lastEntry = undoStack[undoStack.length - 1];

    if (lastEntry.type === "add") {
      // Remove the strokes that were added
      const strokeIds = new Set(lastEntry.strokes.map(s => s.id));
      setStrokes(prev => prev.filter(s => !strokeIds.has(s.id)));
    } else {
      // Re-add the strokes that were deleted
      setStrokes(prev => [...prev, ...lastEntry.strokes]);
    }

    // Move to redo stack
    setRedoStack(prev => [...prev, lastEntry]);
    setUndoStack(prev => prev.slice(0, -1));
  }, [undoStack]);

  // Redo last undone action
  const redo = useCallback(() => {
    if (redoStack.length === 0) return;

    const lastEntry = redoStack[redoStack.length - 1];

    if (lastEntry.type === "add") {
      // Re-add the strokes
      setStrokes(prev => [...prev, ...lastEntry.strokes]);
    } else {
      // Remove the strokes again
      const strokeIds = new Set(lastEntry.strokes.map(s => s.id));
      setStrokes(prev => prev.filter(s => !strokeIds.has(s.id)));
    }

    // Move to undo stack
    setUndoStack(prev => [...prev, lastEntry]);
    setRedoStack(prev => prev.slice(0, -1));
  }, [redoStack]);

  return {
    strokes,
    currentStroke,
    startStroke,
    addPointToStroke,
    endStroke,
    deleteStrokesAtPoint,
    commitEraseBatch,
    getStrokesForLayer,
    clearLayerStrokes,
    canUndo,
    canRedo,
    undo,
    redo,
    setStrokes,
  };
};
