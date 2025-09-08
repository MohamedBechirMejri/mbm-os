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
    <div className="wm-safari-toolbar relative z-[1] grid grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-2 pointer-events-auto">
      {/* Left: Back/Forward group */}
      <div className="flex h-9 items-center gap-1 rounded-[1.25rem] p-0.5 ring-1 ring-inset ring-white/15 bg-black/20 supports-[backdrop-filter]:backdrop-blur-md supports-[backdrop-filter]:bg-black/25 shadow-[inset_2px_2px_1px_rgba(255,255,255,.35),inset_-1px_-1px_1px_rgba(255,255,255,.3)]">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Back"
              disabled={!canGoBack}
              onClick={onBack}
              className="h-8 w-8 rounded-full text-white/90 hover:bg-white/10 disabled:opacity-40"
            >
              <ArrowLeft className="size-[1.05rem]" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Back</TooltipContent>
        </Tooltip>
        <Separator orientation="vertical" className="mx-0.5 h-5 bg-white/20" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Forward"
              disabled={!canGoForward}
              onClick={onForward}
              className="h-8 w-8 rounded-full text-white/90 hover:bg-white/10 disabled:opacity-40"
            >
              <ArrowRight className="size-[1.05rem]" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Forward</TooltipContent>
        </Tooltip>
      </div>

      {/* Center: Address/Search field */}
      <div className="flex min-w-0 flex-1 items-center">
        <div className="group relative mx-auto flex h-10 w-full max-w-[46rem] items-center gap-2 rounded-[1.375rem] border border-white/15 bg-black/25 px-3 shadow-sm supports-[backdrop-filter]:backdrop-blur-md supports-[backdrop-filter]:bg-black/35 ring-1 ring-inset ring-white/15 focus-within:ring-2 focus-within:ring-sky-400/50 shadow-[inset_2px_2px_1px_rgba(255,255,255,.35),inset_-1px_-1px_1px_rgba(255,255,255,.3)]">
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
          <Separator orientation="vertical" className="h-5 bg-white/20" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={activeTab.loading ? "Stop" : "Reload"}
                onClick={() => (activeTab.loading ? onStop() : onReload())}
                className="h-8 w-8 rounded-full text-white/90 hover:bg-white/10 ring-1 ring-inset ring-white/15"
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
              className="h-9 w-9 rounded-full text-white/90 hover:bg-white/10"
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
