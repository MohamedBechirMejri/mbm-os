import {
  Paintbrush,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  Download,
} from "lucide-react";
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
  onClear: () => void;
  onExport: () => void;
}

export function Toolbar({
  tool,
  brush,
  canUndo,
  canRedo,
  onToolChange,
  onBrushChange,
  onUndo,
  onRedo,
  onClear,
  onExport,
}: ToolbarProps) {
  return (
    <div className="flex flex-col gap-6 p-4 h-full overflow-y-auto">
      {/* Tools Section */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">
          Tools
        </h3>
        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={tool === "brush" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => onToolChange("brush")}
                className="h-10 w-10"
              >
                <Paintbrush className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Brush (B)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={tool === "eraser" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => onToolChange("eraser")}
                className="h-10 w-10"
              >
                <Eraser className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Eraser (E)</TooltipContent>
          </Tooltip>
        </div>
      </section>

      {/* Brush Size Section */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">
          Size
        </h3>
        <div className="flex items-center gap-3">
          <Slider
            value={brush.size}
            min={BRUSH_SIZE.min}
            max={BRUSH_SIZE.max}
            step={BRUSH_SIZE.step}
            onChange={value => onBrushChange({ size: value })}
            className="flex-1"
          />
          <span className="text-sm text-white/60 w-8 text-right tabular-nums">
            {brush.size}
          </span>
        </div>
        {/* Size preview */}
        <div className="mt-3 flex justify-center">
          <div
            className="rounded-full bg-white"
            style={{
              width: Math.min(brush.size, 50),
              height: Math.min(brush.size, 50),
            }}
          />
        </div>
      </section>

      {/* Color Section */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">
          Color
        </h3>
        {/* Current color display with picker */}
        <div className="relative mb-3">
          <div
            className="w-full h-10 rounded-lg border border-white/20 cursor-pointer"
            style={{ backgroundColor: brush.color }}
          />
          <input
            type="color"
            value={brush.color}
            onChange={e => onBrushChange({ color: e.target.value })}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>
        {/* Color palette */}
        <div className="grid grid-cols-5 gap-2">
          {COLOR_PALETTE.map(color => (
            <button
              key={color}
              onClick={() => onBrushChange({ color })}
              className={cn(
                "w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110",
                brush.color === color
                  ? "border-white scale-110"
                  : "border-white/20"
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </section>

      {/* History Section */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">
          History
        </h3>
        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onUndo}
                disabled={!canUndo}
                className="h-10 w-10"
              >
                <Undo2 className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo (⌘Z)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onRedo}
                disabled={!canRedo}
                className="h-10 w-10"
              >
                <Redo2 className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo (⌘⇧Z)</TooltipContent>
          </Tooltip>
        </div>
      </section>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions Section */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">
          Actions
        </h3>
        <div className="flex flex-col gap-2">
          <Button
            variant="ghost"
            onClick={onClear}
            className="justify-start gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear Canvas
          </Button>

          <Button
            variant="secondary"
            onClick={onExport}
            className="justify-start gap-2"
          >
            <Download className="w-4 h-4" />
            Export PNG
          </Button>
        </div>
      </section>
    </div>
  );
}
