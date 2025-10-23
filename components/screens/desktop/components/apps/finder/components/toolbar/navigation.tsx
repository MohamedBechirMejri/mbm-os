import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavigationProps {
  canGoBack: boolean;
  onGoBack: () => void;
}

export function Navigation({ canGoBack, onGoBack }: NavigationProps) {
  return (
    <div className="flex items-center gap-[0.35rem] rounded-full bg-white/12 px-1.5 py-[0.2rem]">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="size-7 rounded-full text-white/90 hover:bg-white/18 disabled:opacity-30"
            onClick={onGoBack}
            disabled={!canGoBack}
            aria-label="Go Back"
          >
            <ChevronLeft className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Go back</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Button
              size="icon"
              variant="ghost"
              className="size-7 rounded-full text-white/55 hover:bg-white/18 disabled:opacity-30"
              disabled
              aria-label="Go Forward"
            >
              <ChevronRight className="size-4" />
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>Go forward</TooltipContent>
      </Tooltip>
    </div>
  );
}
