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
    <div className="wm-safari-toolbar relative z-[1] flex items-center gap-2 px-2 py-1.5 pointer-events-auto">
      {/* Left: Back/Forward grouped like Safari */}
      <div className="flex items-center gap-1 rounded-full bg-black/20 p-0.5 shadow-sm ring-1 ring-inset ring-white/10">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Back"
              disabled={!canGoBack}
              onClick={onBack}
              className="h-8 w-8 rounded-full text-white/90 hover:bg-white/10"
            >
              <ArrowLeft className="size-[1.05rem]" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Back</TooltipContent>
        </Tooltip>
        <Separator orientation="vertical" className="mx-0.5 h-5" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Forward"
              disabled={!canGoForward}
              onClick={onForward}
              className="h-8 w-8 rounded-full text-white/90 hover:bg-white/10"
            >
              <ArrowRight className="size-[1.05rem]" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Forward</TooltipContent>
        </Tooltip>
      </div>

      {/* Center: Address/Search field */}
      <div className="flex min-w-0 flex-1 items-center">
        <div className="group relative flex w-full items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 shadow-sm backdrop-blur ring-1 ring-inset ring-white/5 focus-within:ring-2 focus-within:ring-sky-500/50">
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
              <Globe className="size-4 text-white/80" />
            )}
          </div>
          <Input
            className="h-7 w-full border-0 bg-transparent p-0 text-[0.9rem] outline-none ring-0 placeholder:text-white/50 text-white focus-visible:ring-0"
            placeholder="Search or enter website name"
            value={activeTab.input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter")
                onNavigate((e.target as HTMLInputElement).value);
            }}
            aria-label="Address and search"
          />
          <Separator orientation="vertical" className="h-5" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={activeTab.loading ? "Stop" : "Reload"}
                onClick={() => (activeTab.loading ? onStop() : onReload())}
                className="h-7 w-7 rounded-full text-white/90 hover:bg-white/10"
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
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Share / Open"
              onClick={() =>
                window.open(activeTab.url, "_blank", "noopener,noreferrer")
              }
              className="h-8 w-8 rounded-full text-white/90 hover:bg-white/10"
            >
              <SquareArrowOutUpRight className="size-[1.05rem]" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Open in new window</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="New tab"
              onClick={onNewTab}
              className="h-8 w-8 rounded-full text-white/90 hover:bg-white/10"
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
