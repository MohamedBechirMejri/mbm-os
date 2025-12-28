import { useCallback, useMemo, useState } from "react";
import type {
  HistoryEntry,
  Point,
  ShapeCommand,
  ShapeDefinition,
  ToolType,
  NewShapeCommand,
} from "./types";
import { PRESETS } from "./presets";

// Generate unique IDs for commands
let idCounter = Date.now();
export const generateId = () => `cmd-${++idCounter}`;

// Default starting shape - a simple square
const DEFAULT_SHAPE: ShapeDefinition = {
  start: { x: 10, y: 10, xPercent: true, yPercent: true },
  commands: [
    {
      id: generateId(),
      type: "line",
      mode: "to",
      point: { x: 90, y: 10, xPercent: true, yPercent: true },
    },
    {
      id: generateId(),
      type: "line",
      mode: "to",
      point: { x: 90, y: 90, xPercent: true, yPercent: true },
    },
    {
      id: generateId(),
      type: "line",
      mode: "to",
      point: { x: 10, y: 90, xPercent: true, yPercent: true },
    },
    { id: generateId(), type: "close" },
  ],
};

const MAX_HISTORY = 50;

export function useShapeBuilder() {
  // Current shape state
  const [shape, setShape] = useState<ShapeDefinition>(DEFAULT_SHAPE);

  // History for undo/redo
  const [history, setHistory] = useState<HistoryEntry[]>([
    { shape: DEFAULT_SHAPE, description: "Initial shape" },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // UI state
  const [selectedCommandId, setSelectedCommandId] = useState<string | null>(
    null
  );
  const [activeTool, setActiveTool] = useState<ToolType>("select");

  // Push a new state to history
  const pushHistory = useCallback(
    (newShape: ShapeDefinition, description: string) => {
      setHistory(prev => {
        // Remove any future states if we're not at the end
        const trimmed = prev.slice(0, historyIndex + 1);
        const updated = [...trimmed, { shape: newShape, description }];
        // Keep history size manageable
        if (updated.length > MAX_HISTORY) {
          return updated.slice(-MAX_HISTORY);
        }
        return updated;
      });
      setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1));
      setShape(newShape);
    },
    [historyIndex]
  );

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setShape(history[newIndex].shape);
    }
  }, [history, historyIndex]);

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setShape(history[newIndex].shape);
    }
  }, [history, historyIndex]);

  // Check if undo/redo are available
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Update start point
  const updateStartPoint = useCallback(
    (point: Point) => {
      const newShape = { ...shape, start: point };
      pushHistory(newShape, "Move start point");
    },
    [shape, pushHistory]
  );

  // Add a new command
  const addCommand = useCallback(
    (command: NewShapeCommand) => {
      const newCommand = { ...command, id: generateId() } as ShapeCommand;
      // Insert before the close command if one exists
      const closeIndex = shape.commands.findIndex(c => c.type === "close");
      let newCommands: ShapeCommand[];

      if (closeIndex >= 0) {
        newCommands = [
          ...shape.commands.slice(0, closeIndex),
          newCommand,
          ...shape.commands.slice(closeIndex),
        ];
      } else {
        newCommands = [...shape.commands, newCommand];
      }

      const newShape = { ...shape, commands: newCommands };
      pushHistory(newShape, `Add ${command.type} command`);
      setSelectedCommandId(newCommand.id);
    },
    [shape, pushHistory]
  );

  // Update an existing command
  const updateCommand = useCallback(
    (id: string, updates: Partial<ShapeCommand>) => {
      const newCommands = shape.commands.map(cmd =>
        cmd.id === id ? ({ ...cmd, ...updates } as ShapeCommand) : cmd
      );
      const newShape = { ...shape, commands: newCommands };
      pushHistory(newShape, "Update command");
    },
    [shape, pushHistory]
  );

  // Delete a command
  const deleteCommand = useCallback(
    (id: string) => {
      const newCommands = shape.commands.filter(cmd => cmd.id !== id);
      const newShape = { ...shape, commands: newCommands };
      pushHistory(newShape, "Delete command");
      if (selectedCommandId === id) {
        setSelectedCommandId(null);
      }
    },
    [shape, pushHistory, selectedCommandId]
  );

  // Load a preset
  const loadPreset = useCallback(
    (presetKey: string) => {
      const preset = PRESETS[presetKey];
      if (preset) {
        // Deep clone the preset shape to avoid mutations
        const clonedShape = JSON.parse(
          JSON.stringify(preset.shape)
        ) as ShapeDefinition;
        // Regenerate IDs for uniqueness
        clonedShape.commands = clonedShape.commands.map(cmd => ({
          ...cmd,
          id: generateId(),
        }));
        pushHistory(clonedShape, `Load preset: ${preset.name}`);
        setSelectedCommandId(null);
      }
    },
    [pushHistory]
  );

  // Clear all commands
  const clearShape = useCallback(() => {
    const newShape: ShapeDefinition = {
      start: { x: 50, y: 50, xPercent: true, yPercent: true },
      commands: [],
    };
    pushHistory(newShape, "Clear shape");
    setSelectedCommandId(null);
  }, [pushHistory]);

  // Generate CSS code
  const cssCode = useMemo(() => {
    return generateCss(shape);
  }, [shape]);

  // Generate SVG path for preview (approximation)
  const svgPath = useMemo(() => {
    return generateSvgPath(shape);
  }, [shape]);

  return {
    // State
    shape,
    selectedCommandId,
    activeTool,
    canUndo,
    canRedo,
    cssCode,
    svgPath,

    // Actions
    setSelectedCommandId,
    setActiveTool,
    updateStartPoint,
    addCommand,
    updateCommand,
    deleteCommand,
    loadPreset,
    clearShape,
    undo,
    redo,
  };
}

// Format a point value for CSS output
function formatValue(value: number, isPercent?: boolean): string {
  if (isPercent) {
    return `${value}%`;
  }
  return `${value}px`;
}

// Format a point for CSS output
function formatPoint(point: Point): string {
  return `${formatValue(point.x, point.xPercent)} ${formatValue(
    point.y,
    point.yPercent
  )}`;
}

// Generate CSS shape() code from a ShapeDefinition
function generateCss(shape: ShapeDefinition): string {
  const parts: string[] = [];

  // Add fill rule if specified
  if (shape.fillRule) {
    parts.push(shape.fillRule);
  }

  // Add starting point
  parts.push(`from ${formatPoint(shape.start)}`);

  // Add each command
  for (const cmd of shape.commands) {
    switch (cmd.type) {
      case "move":
        parts.push(`move ${cmd.mode} ${formatPoint(cmd.point)}`);
        break;

      case "line":
        parts.push(`line ${cmd.mode} ${formatPoint(cmd.point)}`);
        break;

      case "hline":
        parts.push(`hline ${cmd.mode} ${formatValue(cmd.value, cmd.percent)}`);
        break;

      case "vline":
        parts.push(`vline ${cmd.mode} ${formatValue(cmd.value, cmd.percent)}`);
        break;

      case "curve": {
        let curveStr = `curve ${cmd.mode} ${formatPoint(
          cmd.end
        )} with ${formatPoint(cmd.control1)}`;
        if (cmd.control2) {
          curveStr += ` / ${formatPoint(cmd.control2)}`;
        }
        parts.push(curveStr);
        break;
      }

      case "smooth": {
        let smoothStr = `smooth ${cmd.mode} ${formatPoint(cmd.end)}`;
        if (cmd.control) {
          smoothStr += ` with ${formatPoint(cmd.control)}`;
        }
        parts.push(smoothStr);
        break;
      }

      case "arc": {
        let arcStr = `arc ${cmd.mode} ${formatPoint(cmd.end)} of ${cmd.rx}%`;
        if (cmd.ry !== undefined && cmd.ry !== cmd.rx) {
          arcStr += ` ${cmd.ry}%`;
        }
        if (cmd.sweep) {
          arcStr += ` ${cmd.sweep}`;
        }
        if (cmd.size) {
          arcStr += ` ${cmd.size}`;
        }
        if (cmd.rotate !== undefined && cmd.rotate !== 0) {
          arcStr += ` rotate ${cmd.rotate}deg`;
        }
        parts.push(arcStr);
        break;
      }

      case "close":
        parts.push("close");
        break;
    }
  }

  // Format with nice indentation
  const commandsStr = parts.join(",\n  ");
  return `clip-path: shape(\n  ${commandsStr}\n);`;
}

// Generate an SVG path string for preview
// Note: This is an approximation since SVG paths work differently than CSS shape()
function generateSvgPath(shape: ShapeDefinition): string {
  const parts: string[] = [];

  // Helper to convert percentage to viewBox coordinate (assuming 100x100 viewBox)
  const toCoord = (value: number, isPercent?: boolean) => {
    return isPercent ? value : (value / 100) * 100;
  };

  // Start point
  const startX = toCoord(shape.start.x, shape.start.xPercent);
  const startY = toCoord(shape.start.y, shape.start.yPercent);
  parts.push(`M ${startX} ${startY}`);

  let currentX = startX;
  let currentY = startY;

  for (const cmd of shape.commands) {
    switch (cmd.type) {
      case "move": {
        if (cmd.mode === "to") {
          currentX = toCoord(cmd.point.x, cmd.point.xPercent);
          currentY = toCoord(cmd.point.y, cmd.point.yPercent);
        } else {
          currentX += toCoord(cmd.point.x, cmd.point.xPercent);
          currentY += toCoord(cmd.point.y, cmd.point.yPercent);
        }
        parts.push(`M ${currentX} ${currentY}`);
        break;
      }

      case "line": {
        if (cmd.mode === "to") {
          currentX = toCoord(cmd.point.x, cmd.point.xPercent);
          currentY = toCoord(cmd.point.y, cmd.point.yPercent);
        } else {
          currentX += toCoord(cmd.point.x, cmd.point.xPercent);
          currentY += toCoord(cmd.point.y, cmd.point.yPercent);
        }
        parts.push(`L ${currentX} ${currentY}`);
        break;
      }

      case "hline": {
        if (cmd.mode === "to") {
          currentX = toCoord(cmd.value, cmd.percent);
        } else {
          currentX += toCoord(cmd.value, cmd.percent);
        }
        parts.push(`H ${currentX}`);
        break;
      }

      case "vline": {
        if (cmd.mode === "to") {
          currentY = toCoord(cmd.value, cmd.percent);
        } else {
          currentY += toCoord(cmd.value, cmd.percent);
        }
        parts.push(`V ${currentY}`);
        break;
      }

      case "curve": {
        const endX =
          cmd.mode === "to"
            ? toCoord(cmd.end.x, cmd.end.xPercent)
            : currentX + toCoord(cmd.end.x, cmd.end.xPercent);
        const endY =
          cmd.mode === "to"
            ? toCoord(cmd.end.y, cmd.end.yPercent)
            : currentY + toCoord(cmd.end.y, cmd.end.yPercent);

        const c1x = toCoord(cmd.control1.x, cmd.control1.xPercent);
        const c1y = toCoord(cmd.control1.y, cmd.control1.yPercent);

        if (cmd.control2) {
          // Cubic Bézier
          const c2x = toCoord(cmd.control2.x, cmd.control2.xPercent);
          const c2y = toCoord(cmd.control2.y, cmd.control2.yPercent);
          parts.push(`C ${c1x} ${c1y}, ${c2x} ${c2y}, ${endX} ${endY}`);
        } else {
          // Quadratic Bézier
          parts.push(`Q ${c1x} ${c1y}, ${endX} ${endY}`);
        }
        currentX = endX;
        currentY = endY;
        break;
      }

      case "smooth": {
        const endX =
          cmd.mode === "to"
            ? toCoord(cmd.end.x, cmd.end.xPercent)
            : currentX + toCoord(cmd.end.x, cmd.end.xPercent);
        const endY =
          cmd.mode === "to"
            ? toCoord(cmd.end.y, cmd.end.yPercent)
            : currentY + toCoord(cmd.end.y, cmd.end.yPercent);

        if (cmd.control) {
          // Smooth cubic
          const cx = toCoord(cmd.control.x, cmd.control.xPercent);
          const cy = toCoord(cmd.control.y, cmd.control.yPercent);
          parts.push(`S ${cx} ${cy}, ${endX} ${endY}`);
        } else {
          // Smooth quadratic
          parts.push(`T ${endX} ${endY}`);
        }
        currentX = endX;
        currentY = endY;
        break;
      }

      case "arc": {
        const endX =
          cmd.mode === "to"
            ? toCoord(cmd.end.x, cmd.end.xPercent)
            : currentX + toCoord(cmd.end.x, cmd.end.xPercent);
        const endY =
          cmd.mode === "to"
            ? toCoord(cmd.end.y, cmd.end.yPercent)
            : currentY + toCoord(cmd.end.y, cmd.end.yPercent);

        const rx = cmd.rx;
        const ry = cmd.ry ?? cmd.rx;
        const rotation = cmd.rotate ?? 0;
        const largeArc = cmd.size === "large" ? 1 : 0;
        const sweep = cmd.sweep === "cw" ? 1 : 0;

        parts.push(
          `A ${rx} ${ry} ${rotation} ${largeArc} ${sweep} ${endX} ${endY}`
        );
        currentX = endX;
        currentY = endY;
        break;
      }

      case "close":
        parts.push("Z");
        currentX = startX;
        currentY = startY;
        break;
    }
  }

  return parts.join(" ");
}

export type ShapeBuilderState = ReturnType<typeof useShapeBuilder>;
