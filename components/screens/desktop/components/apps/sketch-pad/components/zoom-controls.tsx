import { Minus, Plus, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

// Bottom-right zoom controls
export function ZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
}: ZoomControlsProps) {
  const zoomPercent = Math.round(zoom * 100);

  return (
    <div className="flex items-center gap-1 bg-[#232329]/90 backdrop-blur-md rounded-lg border border-white/10 p-1 shadow-xl">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onZoomOut}
            className="h-7 w-7"
          >
            <Minus className="w-3.5 h-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">Zoom Out</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onReset}
            className="px-2 text-xs text-white/70 hover:text-white tabular-nums min-w-12 text-center"
          >
            {zoomPercent}%
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">Reset Zoom</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onZoomIn}
            className="h-7 w-7"
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">Zoom In</TooltipContent>
      </Tooltip>
    </div>
  );
}
