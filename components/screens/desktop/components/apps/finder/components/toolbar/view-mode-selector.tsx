import { Columns3, Grid2X2, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ViewMode } from "../../types";

interface ViewModeSelectorProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function ViewModeSelector({
  view,
  onViewChange,
}: ViewModeSelectorProps) {
  return (
    <div className="flex items-center gap-1 rounded-[0.9rem] bg-white/10 p-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant={view === "grid" ? "default" : "ghost"}
            className="size-7 rounded-md"
            aria-label="Grid view"
            onClick={() => onViewChange("grid")}
          >
            <Grid2X2 className="size-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Grid view</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant={view === "list" ? "default" : "ghost"}
            className="size-7 rounded-md"
            aria-label="List view"
            onClick={() => onViewChange("list")}
          >
            <List className="size-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>List view</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant={view === "columns" ? "default" : "ghost"}
            className="size-7 rounded-md"
            aria-label="Column view"
            onClick={() => onViewChange("columns")}
          >
            <Columns3 className="size-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Column view</TooltipContent>
      </Tooltip>
    </div>
  );
}
