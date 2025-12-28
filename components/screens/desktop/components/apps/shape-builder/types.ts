/**
 * Types for the CSS shape() builder
 * Based on the CSS basic-shape shape() function specification
 */

// A point in 2D space with optional percentage/pixel values
export interface Point {
  x: number;
  y: number;
  // Whether values are percentages (true) or pixels (false)
  xPercent?: boolean;
  yPercent?: boolean;
}

// Fill rule for overlapping regions
export type FillRule = "nonzero" | "evenodd";

// Position mode: relative (by) or absolute (to)
export type PositionMode = "by" | "to";

// Arc sweep direction
export type ArcSweep = "cw" | "ccw";

// Arc size
export type ArcSize = "large" | "small";

// Base command interface
interface BaseCommand {
  id: string; // Unique identifier for React keys and selection
}

// Move command - repositions without drawing
export interface MoveCommand extends BaseCommand {
  type: "move";
  mode: PositionMode;
  point: Point;
}

// Line command - draws a straight line
export interface LineCommand extends BaseCommand {
  type: "line";
  mode: PositionMode;
  point: Point;
}

// Horizontal line command
export interface HLineCommand extends BaseCommand {
  type: "hline";
  mode: PositionMode;
  value: number;
  percent?: boolean;
}

// Vertical line command
export interface VLineCommand extends BaseCommand {
  type: "vline";
  mode: PositionMode;
  value: number;
  percent?: boolean;
}

// Curve command - draws a Bézier curve
export interface CurveCommand extends BaseCommand {
  type: "curve";
  mode: PositionMode;
  end: Point;
  control1: Point;
  control2?: Point; // Optional second control point for cubic curves
}

// Smooth curve command - continuation of previous curve
export interface SmoothCommand extends BaseCommand {
  type: "smooth";
  mode: PositionMode;
  end: Point;
  control?: Point; // Optional control point
}

// Arc command - draws an elliptical arc
export interface ArcCommand extends BaseCommand {
  type: "arc";
  mode: PositionMode;
  end: Point;
  rx: number; // Horizontal radius
  ry?: number; // Vertical radius (defaults to rx if omitted)
  sweep?: ArcSweep; // Default: ccw
  size?: ArcSize; // Default: small
  rotate?: number; // Rotation angle in degrees
}

// Close command - closes the path
export interface CloseCommand extends BaseCommand {
  type: "close";
}

// Union of all command types
export type ShapeCommand =
  | MoveCommand
  | LineCommand
  | HLineCommand
  | VLineCommand
  | CurveCommand
  | SmoothCommand
  | ArcCommand
  | CloseCommand;

// Command types without ID - used for adding new commands
// We need this separate type because Omit<ShapeCommand, "id"> loses the discriminated union
export type NewShapeCommand =
  | { type: "move"; mode: PositionMode; point: Point }
  | { type: "line"; mode: PositionMode; point: Point }
  | { type: "hline"; mode: PositionMode; value: number; percent?: boolean }
  | { type: "vline"; mode: PositionMode; value: number; percent?: boolean }
  | {
      type: "curve";
      mode: PositionMode;
      end: Point;
      control1: Point;
      control2?: Point;
    }
  | { type: "smooth"; mode: PositionMode; end: Point; control?: Point }
  | {
      type: "arc";
      mode: PositionMode;
      end: Point;
      rx: number;
      ry?: number;
      sweep?: ArcSweep;
      size?: ArcSize;
      rotate?: number;
    }
  | { type: "close" };

// The complete shape definition
export interface ShapeDefinition {
  fillRule?: FillRule;
  start: Point; // The "from" point
  commands: ShapeCommand[];
}

// Tool types for the toolbar
export type ToolType =
  | "select"
  | "line"
  | "hline"
  | "vline"
  | "curve"
  | "smooth"
  | "arc"
  | "close";

// Canvas state
export interface CanvasState {
  shape: ShapeDefinition;
  selectedCommandId: string | null;
  selectedPointType: "start" | "end" | "control1" | "control2" | null;
  activeTool: ToolType;
  zoom: number;
  pan: Point;
}

// History entry for undo/redo
export interface HistoryEntry {
  shape: ShapeDefinition;
  description: string;
}
