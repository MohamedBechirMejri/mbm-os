"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Circle,
  CornerDownRight,
  Minus,
  MousePointer2,
  MoveHorizontal,
  MoveVertical,
  Spline,
  X,
} from "lucide-react";
import type { ShapeBuilderState } from "./use-shape-builder";
import type { ToolType } from "./types";
import { PRESET_KEYS, PRESETS } from "./presets";

interface ToolbarProps {
  state: ShapeBuilderState;
}

// Tool definitions with icons and tooltips
const TOOLS: Array<{
  type: ToolType;
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
}> = [
  {
    type: "select",
    icon: <MousePointer2 className="size-4" />,
    label: "Select & Move",
    shortcut: "V",
  },
  {
    type: "line",
    icon: <ArrowRight className="size-4" />,
    label: "Line",
    shortcut: "L",
  },
  {
    type: "hline",
    icon: <MoveHorizontal className="size-4" />,
    label: "Horizontal Line",
    shortcut: "H",
  },
  {
    type: "vline",
    icon: <MoveVertical className="size-4" />,
    label: "Vertical Line",
  },
  {
    type: "curve",
    icon: <Spline className="size-4" />,
    label: "Curve",
    shortcut: "C",
  },
  {
    type: "smooth",
    icon: <CornerDownRight className="size-4" />,
    label: "Smooth Curve",
    shortcut: "S",
  },
  {
    type: "arc",
    icon: <Circle className="size-4" />,
    label: "Arc",
    shortcut: "A",
  },
  {
    type: "close",
    icon: <X className="size-4" />,
    label: "Close Path",
    shortcut: "Z",
  },
];

export function Toolbar({ state }: ToolbarProps) {
  const {
    activeTool,
    setActiveTool,
    loadPreset,
    clearShape,
    undo,
    redo,
    canUndo,
    canRedo,
  } = state;

  return (
    <div className="flex flex-col gap-3 p-3 border-r border-white/10 bg-black/20 backdrop-blur-xl">
      {/* Tool buttons */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] uppercase text-white/40 px-1 mb-1">
          Tools
        </span>
        {TOOLS.map(tool => (
          <Tooltip key={tool.type}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "size-9 rounded-lg transition-all",
                  activeTool === tool.type
                    ? "bg-white/20 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                )}
                onClick={() => setActiveTool(tool.type)}
              >
                {tool.icon}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="flex items-center gap-2">
              {tool.label}
              {tool.shortcut && (
                <kbd className="px-1.5 py-0.5 text-[10px] bg-white/10 rounded">
                  {tool.shortcut}
                </kbd>
              )}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* Divider */}
      <div className="h-px bg-white/10" />

      {/* Presets */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] uppercase text-white/40 px-1 mb-1">
          Presets
        </span>
        <div className="grid grid-cols-2 gap-1">
          {PRESET_KEYS.map(key => (
            <Tooltip key={key}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[10px] text-white/60 hover:text-white hover:bg-white/10 px-2"
                  onClick={() => loadPreset(key)}
                >
                  {PRESETS[key].name.slice(0, 6)}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{PRESETS[key].name}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/10" />

      {/* Actions */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] uppercase text-white/40 px-1 mb-1">
          Actions
        </span>
        <div className="flex gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-7 text-[10px] text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30"
                onClick={undo}
                disabled={!canUndo}
              >
                Undo
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              Undo{" "}
              <kbd className="ml-1 px-1 py-0.5 text-[10px] bg-white/10 rounded">
                ⌘Z
              </kbd>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-7 text-[10px] text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30"
                onClick={redo}
                disabled={!canRedo}
              >
                Redo
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              Redo{" "}
              <kbd className="ml-1 px-1 py-0.5 text-[10px] bg-white/10 rounded">
                ⌘⇧Z
              </kbd>
            </TooltipContent>
          </Tooltip>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-[10px] text-red-400/80 hover:text-red-400 hover:bg-red-500/10"
          onClick={clearShape}
        >
          Clear All
        </Button>
      </div>
    </div>
  );
}
