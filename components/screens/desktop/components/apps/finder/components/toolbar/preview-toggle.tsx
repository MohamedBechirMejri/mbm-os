import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PreviewToggleProps {
  showPreview: boolean;
  onPreviewToggle: () => void;
}

export function PreviewToggle({
  showPreview,
  onPreviewToggle,
}: PreviewToggleProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant={showPreview ? "default" : "ghost"}
          className="size-7 rounded-[0.85rem]"
          aria-label="Toggle preview"
          onClick={onPreviewToggle}
        >
          {showPreview ? (
            <Eye className="size-3.5" />
          ) : (
            <EyeOff className="size-3.5" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {showPreview ? "Hide preview" : "Show preview"}
      </TooltipContent>
    </Tooltip>
  );
}
