"use client";

import { cn } from "@/lib/utils";
import { useCallback, useRef, useState } from "react";
import type { ShapeBuilderState } from "./use-shape-builder";
import type { Point, ShapeCommand } from "./types";
import { generateId } from "./use-shape-builder";

interface CanvasProps {
  state: ShapeBuilderState;
}

// Canvas dimensions (we use a 0-100 coordinate system internally)
const CANVAS_SIZE = 100;

// Point handle size
const HANDLE_SIZE = 8;

// Control point handle size (smaller)
const CONTROL_HANDLE_SIZE = 6;

export function Canvas({ state }: CanvasProps) {
  const {
    shape,
    svgPath,
    selectedCommandId,
    setSelectedCommandId,
    activeTool,
    updateStartPoint,
    addCommand,
    updateCommand,
  } = state;

  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<{
    type: "start" | "end" | "control1" | "control2";
    commandId?: string;
  } | null>(null);

  // Convert screen coordinates to SVG coordinates
  const screenToSvg = useCallback((clientX: number, clientY: number): Point => {
    if (!svgRef.current) return { x: 0, y: 0 };

    const rect = svgRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * CANVAS_SIZE;
    const y = ((clientY - rect.top) / rect.height) * CANVAS_SIZE;

    // Clamp to canvas bounds
    return {
      x: Math.max(0, Math.min(CANVAS_SIZE, x)),
      y: Math.max(0, Math.min(CANVAS_SIZE, y)),
      xPercent: true,
      yPercent: true,
    };
  }, []);

  // Handle canvas click to add new points
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (dragging) return;

      const point = screenToSvg(e.clientX, e.clientY);

      // Add command based on active tool
      switch (activeTool) {
        case "line":
          addCommand({
            type: "line",
            mode: "to",
            point,
          });
          break;

        case "hline":
          addCommand({
            type: "hline",
            mode: "to",
            value: point.x,
            percent: true,
          });
          break;

        case "vline":
          addCommand({
            type: "vline",
            mode: "to",
            value: point.y,
            percent: true,
          });
          break;

        case "curve":
          // Find last point position for control point calculation
          const lastPoint = getLastPoint(shape);
          const midX = (lastPoint.x + point.x) / 2;
          const midY = (lastPoint.y + point.y) / 2 - 20;
          addCommand({
            type: "curve",
            mode: "to",
            end: point,
            control1: {
              x: midX,
              y: Math.max(0, midY),
              xPercent: true,
              yPercent: true,
            },
          });
          break;

        case "smooth":
          addCommand({
            type: "smooth",
            mode: "to",
            end: point,
          });
          break;

        case "arc":
          addCommand({
            type: "arc",
            mode: "to",
            end: point,
            rx: 20,
            sweep: "cw",
          });
          break;

        case "close":
          // Check if we already have a close command
          if (!shape.commands.some(c => c.type === "close")) {
            addCommand({ type: "close" });
          }
          break;

        default:
          // Select tool - clicking empty space deselects
          setSelectedCommandId(null);
      }
    },
    [activeTool, addCommand, dragging, screenToSvg, setSelectedCommandId, shape]
  );

  // Handle mouse down on a point handle
  const handlePointMouseDown = useCallback(
    (
      e: React.MouseEvent,
      type: "start" | "end" | "control1" | "control2",
      commandId?: string
    ) => {
      e.stopPropagation();
      setDragging({ type, commandId });
      if (commandId) {
        setSelectedCommandId(commandId);
      }
    },
    [setSelectedCommandId]
  );

  // Handle mouse move for dragging
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging) return;

      const point = screenToSvg(e.clientX, e.clientY);

      if (dragging.type === "start") {
        updateStartPoint(point);
      } else if (dragging.commandId) {
        const cmd = shape.commands.find(c => c.id === dragging.commandId);
        if (!cmd) return;

        switch (cmd.type) {
          case "line":
          case "move":
            if (dragging.type === "end") {
              updateCommand(cmd.id, { point });
            }
            break;

          case "curve":
            if (dragging.type === "end") {
              updateCommand(cmd.id, { end: point });
            } else if (dragging.type === "control1") {
              updateCommand(cmd.id, { control1: point });
            } else if (dragging.type === "control2") {
              updateCommand(cmd.id, { control2: point });
            }
            break;

          case "smooth":
            if (dragging.type === "end") {
              updateCommand(cmd.id, { end: point });
            } else if (dragging.type === "control1") {
              updateCommand(cmd.id, { control: point });
            }
            break;

          case "arc":
            if (dragging.type === "end") {
              updateCommand(cmd.id, { end: point });
            }
            break;
        }
      }
    },
    [dragging, screenToSvg, shape.commands, updateCommand, updateStartPoint]
  );

  // Handle mouse up to stop dragging
  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  // Render point handles for each command
  const renderHandles = () => {
    const handles: React.ReactNode[] = [];

    // Start point handle
    handles.push(
      <PointHandle
        key="start"
        x={shape.start.x}
        y={shape.start.y}
        type="start"
        selected={false}
        onMouseDown={e => handlePointMouseDown(e, "start")}
      />
    );

    // Command handles
    let currentX = shape.start.x;
    let currentY = shape.start.y;

    for (const cmd of shape.commands) {
      const isSelected = selectedCommandId === cmd.id;

      switch (cmd.type) {
        case "line":
        case "move":
          handles.push(
            <PointHandle
              key={`${cmd.id}-end`}
              x={cmd.point.x}
              y={cmd.point.y}
              type="end"
              selected={isSelected}
              onMouseDown={e => handlePointMouseDown(e, "end", cmd.id)}
            />
          );
          currentX = cmd.point.x;
          currentY = cmd.point.y;
          break;

        case "hline":
          handles.push(
            <PointHandle
              key={`${cmd.id}-end`}
              x={cmd.value}
              y={currentY}
              type="end"
              selected={isSelected}
              onMouseDown={e => handlePointMouseDown(e, "end", cmd.id)}
            />
          );
          currentX = cmd.value;
          break;

        case "vline":
          handles.push(
            <PointHandle
              key={`${cmd.id}-end`}
              x={currentX}
              y={cmd.value}
              type="end"
              selected={isSelected}
              onMouseDown={e => handlePointMouseDown(e, "end", cmd.id)}
            />
          );
          currentY = cmd.value;
          break;

        case "curve":
          // Control point 1 line
          handles.push(
            <ControlLine
              key={`${cmd.id}-c1-line`}
              x1={currentX}
              y1={currentY}
              x2={cmd.control1.x}
              y2={cmd.control1.y}
              visible={isSelected}
            />
          );
          // Control point 1
          handles.push(
            <ControlHandle
              key={`${cmd.id}-c1`}
              x={cmd.control1.x}
              y={cmd.control1.y}
              visible={isSelected}
              onMouseDown={e => handlePointMouseDown(e, "control1", cmd.id)}
            />
          );
          // Control point 2 (if cubic)
          if (cmd.control2) {
            handles.push(
              <ControlLine
                key={`${cmd.id}-c2-line`}
                x1={cmd.end.x}
                y1={cmd.end.y}
                x2={cmd.control2.x}
                y2={cmd.control2.y}
                visible={isSelected}
              />
            );
            handles.push(
              <ControlHandle
                key={`${cmd.id}-c2`}
                x={cmd.control2.x}
                y={cmd.control2.y}
                visible={isSelected}
                onMouseDown={e => handlePointMouseDown(e, "control2", cmd.id)}
              />
            );
          }
          // End point
          handles.push(
            <PointHandle
              key={`${cmd.id}-end`}
              x={cmd.end.x}
              y={cmd.end.y}
              type="end"
              selected={isSelected}
              onMouseDown={e => handlePointMouseDown(e, "end", cmd.id)}
            />
          );
          currentX = cmd.end.x;
          currentY = cmd.end.y;
          break;

        case "smooth":
          // Control point (if specified)
          if (cmd.control) {
            handles.push(
              <ControlLine
                key={`${cmd.id}-c-line`}
                x1={cmd.end.x}
                y1={cmd.end.y}
                x2={cmd.control.x}
                y2={cmd.control.y}
                visible={isSelected}
              />
            );
            handles.push(
              <ControlHandle
                key={`${cmd.id}-c`}
                x={cmd.control.x}
                y={cmd.control.y}
                visible={isSelected}
                onMouseDown={e => handlePointMouseDown(e, "control1", cmd.id)}
              />
            );
          }
          // End point
          handles.push(
            <PointHandle
              key={`${cmd.id}-end`}
              x={cmd.end.x}
              y={cmd.end.y}
              type="end"
              selected={isSelected}
              onMouseDown={e => handlePointMouseDown(e, "end", cmd.id)}
            />
          );
          currentX = cmd.end.x;
          currentY = cmd.end.y;
          break;

        case "arc":
          handles.push(
            <PointHandle
              key={`${cmd.id}-end`}
              x={cmd.end.x}
              y={cmd.end.y}
              type="end"
              selected={isSelected}
              onMouseDown={e => handlePointMouseDown(e, "end", cmd.id)}
            />
          );
          currentX = cmd.end.x;
          currentY = cmd.end.y;
          break;

        case "close":
          // No handles for close
          currentX = shape.start.x;
          currentY = shape.start.y;
          break;
      }
    }

    return handles;
  };

  return (
    <div className="relative flex-1 overflow-hidden bg-[#1a1a1a]">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "10% 10%",
        }}
      />

      {/* SVG canvas */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
        className="absolute inset-4 w-[calc(100%-2rem)] h-[calc(100%-2rem)]"
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: activeTool === "select" ? "default" : "crosshair" }}
      >
        {/* Shape preview fill */}
        <path d={svgPath} fill="rgba(59, 130, 246, 0.3)" stroke="none" />
        {/* Shape outline */}
        <path
          d={svgPath}
          fill="none"
          stroke="rgba(59, 130, 246, 0.8)"
          strokeWidth="0.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Handles */}
        {renderHandles()}
      </svg>

      {/* Tool indicator */}
      <div className="absolute bottom-4 left-4 px-2 py-1 bg-black/50 backdrop-blur-sm rounded text-[10px] text-white/60 uppercase tracking-wider">
        {activeTool}
      </div>
    </div>
  );
}

// Point handle component
function PointHandle({
  x,
  y,
  type,
  selected,
  onMouseDown,
}: {
  x: number;
  y: number;
  type: "start" | "end";
  selected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
}) {
  return (
    <circle
      cx={x}
      cy={y}
      r={HANDLE_SIZE / 2}
      className={cn(
        "cursor-move transition-all",
        type === "start"
          ? "fill-green-500 stroke-green-300"
          : selected
          ? "fill-blue-500 stroke-blue-300"
          : "fill-white stroke-blue-400"
      )}
      strokeWidth="0.5"
      onMouseDown={onMouseDown}
    />
  );
}

// Control point handle component
function ControlHandle({
  x,
  y,
  visible,
  onMouseDown,
}: {
  x: number;
  y: number;
  visible: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
}) {
  if (!visible) return null;

  return (
    <rect
      x={x - CONTROL_HANDLE_SIZE / 2}
      y={y - CONTROL_HANDLE_SIZE / 2}
      width={CONTROL_HANDLE_SIZE}
      height={CONTROL_HANDLE_SIZE}
      className="fill-orange-500 stroke-orange-300 cursor-move"
      strokeWidth="0.3"
      onMouseDown={onMouseDown}
    />
  );
}

// Control line component
function ControlLine({
  x1,
  y1,
  x2,
  y2,
  visible,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  visible: boolean;
}) {
  if (!visible) return null;

  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke="rgba(249, 115, 22, 0.5)"
      strokeWidth="0.3"
      strokeDasharray="1,1"
    />
  );
}

// Helper to get the last point in the shape
function getLastPoint(shape: {
  start: Point;
  commands: ShapeCommand[];
}): Point {
  if (shape.commands.length === 0) {
    return shape.start;
  }

  let lastPoint = shape.start;

  for (const cmd of shape.commands) {
    switch (cmd.type) {
      case "line":
      case "move":
        lastPoint = cmd.point;
        break;
      case "hline":
        lastPoint = { ...lastPoint, x: cmd.value };
        break;
      case "vline":
        lastPoint = { ...lastPoint, y: cmd.value };
        break;
      case "curve":
      case "smooth":
        lastPoint = cmd.end;
        break;
      case "arc":
        lastPoint = cmd.end;
        break;
      case "close":
        lastPoint = shape.start;
        break;
    }
  }

  return lastPoint;
}
