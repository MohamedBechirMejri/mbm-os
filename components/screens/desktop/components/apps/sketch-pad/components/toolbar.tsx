import { Paintbrush, Eraser, Hand, Undo2, Redo2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Tool, BrushSettings } from "../types";
import { COLOR_PALETTE, BRUSH_SIZE } from "../constants";

interface ToolbarProps {
  tool: Tool;
  brush: BrushSettings;
  canUndo: boolean;
  canRedo: boolean;
  onToolChange: (tool: Tool) => void;
  onBrushChange: (settings: Partial<BrushSettings>) => void;
  onUndo: () => void;
  onRedo: () => void;
}

// Compact horizontal toolbar - Excalidraw style
export function Toolbar({
  tool,
  brush,
  canUndo,
  canRedo,
  onToolChange,
  onBrushChange,
  onUndo,
  onRedo,
}: ToolbarProps) {
  return (
    <div className="flex items-center gap-1 bg-[#232329]/90 backdrop-blur-md rounded-lg border border-white/10 p-1.5 shadow-xl">
      {/* Tools */}
      <div className="flex items-center gap-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToolChange("brush")}
              className={cn("h-8 w-8", tool === "brush" && "bg-white/15")}
            >
              <Paintbrush className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Brush (B)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToolChange("eraser")}
              className={cn("h-8 w-8", tool === "eraser" && "bg-white/15")}
            >
              <Eraser className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Eraser (E)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToolChange("pan")}
              className={cn("h-8 w-8", tool === "pan" && "bg-white/15")}
            >
              <Hand className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Pan (Space)</TooltipContent>
        </Tooltip>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-white/10 mx-1" />

      {/* Brush Size */}
      <div className="flex items-center gap-2 px-2">
        <Slider
          value={brush.size}
          min={BRUSH_SIZE.min}
          max={BRUSH_SIZE.max}
          step={BRUSH_SIZE.step}
          onChange={value => onBrushChange({ size: value })}
          className="w-20"
        />
        <span className="text-xs text-white/60 w-6 tabular-nums">
          {brush.size}
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-white/10 mx-1" />

      {/* Color swatches */}
      <div className="flex items-center gap-0.5">
        {COLOR_PALETTE.slice(0, 6).map(color => (
          <button
            key={color}
            onClick={() => onBrushChange({ color })}
            className={cn(
              "w-6 h-6 rounded border-2 transition-transform hover:scale-110",
              brush.color === color ? "border-white" : "border-transparent"
            )}
            style={{ backgroundColor: color }}
          />
        ))}
        {/* Custom color picker */}
        <div className="relative">
          <div
            className="w-6 h-6 rounded border-2 border-white/20"
            style={{ backgroundColor: brush.color }}
          />
          <input
            type="color"
            value={brush.color}
            onChange={e => onBrushChange({ color: e.target.value })}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-white/10 mx-1" />

      {/* Undo/Redo */}
      <div className="flex items-center gap-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onUndo}
              disabled={!canUndo}
              className="h-8 w-8"
            >
              <Undo2 className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Undo (⌘Z)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRedo}
              disabled={!canRedo}
              className="h-8 w-8"
            >
              <Redo2 className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Redo (⌘⇧Z)</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
