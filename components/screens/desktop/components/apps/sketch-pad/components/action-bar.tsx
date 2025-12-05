import { Trash2, Download, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ActionBarProps {
  bgColor: string;
  onBgColorChange: (color: string) => void;
  onClear: () => void;
  onExport: () => void;
}

// Bottom-left action bar - clear, export, bg color
export function ActionBar({
  bgColor,
  onBgColorChange,
  onClear,
  onExport,
}: ActionBarProps) {
  return (
    <div className="flex items-center gap-1 bg-[#232329]/90 backdrop-blur-md rounded-lg border border-white/10 p-1 shadow-xl">
      {/* Background color */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative">
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Palette className="w-3.5 h-3.5" />
            </Button>
            <input
              type="color"
              value={bgColor}
              onChange={e => onBgColorChange(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            {/* Color indicator */}
            <div
              className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full border border-white/30"
              style={{ backgroundColor: bgColor }}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">Background Color</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClear}
            className="h-7 w-7"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">Clear Canvas</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onExport}
            className="h-7 w-7"
          >
            <Download className="w-3.5 h-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">Export PNG</TooltipContent>
      </Tooltip>
    </div>
  );
}
