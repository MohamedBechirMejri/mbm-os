"use client";

import {
  ChevronLeft,
  ChevronRight,
  Plus,
  RotateCw,
  SquareArrowOutUpRight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Tab } from "./types";

// Contract
// - Shows back/forward on the left
// - Centered omnibar with favicon, text input, and reload/stop
// - Share/Open and New Tab on the right
// - No side effects beyond callbacks

type Props = {
  activeTab: Tab;
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
  onReload: () => void;
  onStop: () => void;
  onNavigate: (raw: string) => void;
  onInputChange: (value: string) => void;
  onNewTab: () => void;
};

export function Toolbar({
  activeTab,
  canGoBack,
  canGoForward,
  onBack,
  onForward,
  onReload,
  onStop,
  onNavigate,
  onInputChange,
  onNewTab,
}: Props) {
  return (
    <div className="wm-safari-toolbar relative z-[1] grid grid-cols-[auto_1fr_auto] items-center gap-3 w-full py-2 pointer-events-none">
      {/* Left: Back/Forward group */}
      <div className="flex h-9 items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild className="pointer-events-auto">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Back"
              disabled={!canGoBack}
              onClick={onBack}
              className="size-8 p-1 rounded-full text-white/90 hover:bg-white/10 disabled:opacity-40"
            >
              <ChevronLeft className="size-full" strokeWidth={1.5} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Back</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild className="pointer-events-auto">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Forward"
              disabled={!canGoForward}
              onClick={onForward}
              className="size-8 p-1 rounded-full text-white/90 hover:bg-white/10 disabled:opacity-40"
            >
              <ChevronRight className="size-full" strokeWidth={1.5} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Forward</TooltipContent>
        </Tooltip>
      </div>

      {/* Center: Address/Search field */}
      <div className="flex min-w-0 flex-1 items-center">
        <div className="group relative mx-auto flex h-8 w-full max-w-[26rem] items-center gap-2 rounded-lg border border-white/15 bg-black/25 pointer-events-auto">
          <Input
            className="h-8 w-full border-0 bg-transparent p-0 text-[0.9rem] outline-none ring-0 placeholder:text-white/60 text-white focus-visible:ring-0"
            placeholder="Search or enter website name"
            value={activeTab.input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter")
                onNavigate((e.target as HTMLInputElement).value);
            }}
            aria-label="Address and search"
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={activeTab.loading ? "Stop" : "Reload"}
                onClick={() => (activeTab.loading ? onStop() : onReload())}
                className="h-8 w-8 rounded-full text-white/90 hover:bg-white/10"
              >
                {activeTab.loading ? (
                  <X className="size-4" />
                ) : (
                  <RotateCw className="size-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {activeTab.loading ? "Stop" : "Reload"}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Right: Share + New Tab */}
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild className="pointer-events-auto">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Share / Open"
              onClick={() =>
                window.open(activeTab.url, "_blank", "noopener,noreferrer")
              }
              className="h-9 w-9 rounded-full text-white/90 hover:bg-white/10"
            >
              <SquareArrowOutUpRight className="size-[1.05rem]" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Open in new window</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild className="pointer-events-auto">
            <Button
              variant="ghost"
              size="icon"
              aria-label="New tab"
              onClick={onNewTab}
              className="h-9 w-9 rounded-full text-white/90 hover:bg-white/10"
            >
              <Plus className="size-[1.05rem]" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>New tab</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
