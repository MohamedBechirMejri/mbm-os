"use client";

import {
  ArrowLeft,
  ArrowRight,
  Globe,
  Plus,
  RotateCw,
  SquareArrowOutUpRight,
  X,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Tab } from "./types";

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
    <div className="relative z-[1] flex items-center gap-2 border-b border-border/60 bg-background/60 px-2 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/30">
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Back"
              disabled={!canGoBack}
              onClick={onBack}
            >
              <ArrowLeft className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Back</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Forward"
              disabled={!canGoForward}
              onClick={onForward}
            >
              <ArrowRight className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Forward</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={activeTab.loading ? "Stop" : "Reload"}
              onClick={() => (activeTab.loading ? onStop() : onReload())}
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

      <div className="flex min-w-0 flex-1 items-center">
        <div className="relative flex w-full items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1.5 backdrop-blur supports-[backdrop-filter]:bg-background/30">
          <div className="flex size-4 items-center justify-center">
            {activeTab.favicon ? (
              <Image
                src={activeTab.favicon}
                alt="favicon"
                width={16}
                height={16}
                className="rounded-sm"
              />
            ) : (
              <Globe className="size-4" />
            )}
          </div>
          <Input
            className="h-7 w-full border-0 bg-transparent p-0 text-[0.9rem] focus-visible:ring-0"
            value={activeTab.input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onNavigate(activeTab.input);
            }}
            aria-label="Address and search"
          />
          <Separator orientation="vertical" className="h-5" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open in new window"
                onClick={() =>
                  window.open(activeTab.url, "_blank", "noopener,noreferrer")
                }
              >
                <SquareArrowOutUpRight className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Open in new window</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="New tab"
            onClick={onNewTab}
          >
            <Plus className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>New tab</TooltipContent>
      </Tooltip>
    </div>
  );
}
