import {
  ChevronLeft,
  ChevronRight,
  Columns3,
  Eye,
  EyeOff,
  Grid2X2,
  List,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import GlassSurface from "@/components/ui/glass-surface";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TitlebarPortal } from "../../../window-manager/components/window-view/titlebar-portal";
import type { FSFolder, FSPath } from "../fs";
import type { ViewMode } from "../types";
import { FileIcon } from "./file-icon";

interface ToolbarProps {
  folder: FSFolder;
  currentCrumb: { id: string; name: string } | undefined;
  path: FSPath;
  view: ViewMode;
  showPreview: boolean;
  query: string;
  onGoUp: () => void;
  onViewChange: (view: ViewMode) => void;
  onPreviewToggle: () => void;
  onQueryChange: (query: string) => void;
}

export function Toolbar({
  folder,
  currentCrumb,
  path,
  view,
  showPreview,
  query,
  onGoUp,
  onViewChange,
  onPreviewToggle,
  onQueryChange,
}: ToolbarProps) {
  return (
    <TitlebarPortal>
      <div className="pointer-events-none w-full pl-32 px-4 pt-[1.1rem]">
        <GlassSurface
          width="100%"
          height="auto"
          borderRadius={26}
          blur={18}
          saturation={1.55}
          brightness={48}
          opacity={0.9}
          className="pointer-events-auto w-full !overflow-visible shadow-[0_24px_48px_rgba(6,8,18,0.42)]"
          containerClassName="!p-0 flex w-full items-center justify-between gap-4 rounded-[inherit] px-4 py-[0.85rem] text-[0.8125rem]"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex items-center gap-[0.35rem] rounded-full bg-white/12 px-1.5 py-[0.2rem]">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7 rounded-full text-white/90 hover:bg-white/18 disabled:opacity-30"
                    onClick={onGoUp}
                    disabled={path.length === 0}
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

            <div className="hidden min-w-0 items-center gap-2 rounded-[1.1rem] bg-white/10 px-3 py-[0.45rem] md:flex">
              {currentCrumb ? (
                <>
                  <FileIcon node={folder} size={20} />
                  <span className="truncate text-[0.8125rem] font-medium text-white/85">
                    {currentCrumb.name}
                  </span>
                </>
              ) : (
                <span className="text-white/65">Finder</span>
              )}
            </div>
          </div>

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

          <div className="flex items-center gap-2">
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
            <div className="relative w-[15.5rem] max-w-[40vw]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-white/55" />
              <Input
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Search"
                className="h-8 w-full rounded-[1.1rem] border border-white/12 bg-black/40 pl-9 text-[0.8125rem] text-white placeholder:text-white/55"
              />
            </div>
          </div>
        </GlassSurface>
      </div>
    </TitlebarPortal>
  );
}
