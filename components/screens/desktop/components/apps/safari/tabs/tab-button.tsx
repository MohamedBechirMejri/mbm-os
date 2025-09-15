"use client";

import { Globe, X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Tab } from "../types";

export type TabButtonProps = {
  tab: Tab;
  isActive: boolean;
  onActivate: () => void;
  onClose: () => void;
};

export function TabButton({
  tab,
  isActive,
  onActivate,
  onClose,
}: TabButtonProps) {
  // Derive display title
  const displayTitle = (() => {
    if (tab.title) return tab.title;
    try {
      return new URL(tab.url).hostname;
    } catch {
      return tab.url;
    }
  })();

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-label={displayTitle}
      title={displayTitle}
      className={cn(
        "group relative flex max-w-[16rem] items-center gap-2 px-3 py-1.5 text-[0.9rem] outline-none rounded-md transition-colors",
        isActive
          ? "bg-foreground/15 text-foreground font-medium shadow-inner"
          : "hover:bg-foreground/5 text-foreground/90",
        "focus-visible:ring-2 focus-visible:ring-primary/40",
      )}
      onClick={onActivate}
    >
      {tab.favicon ? (
        <Image
          src={tab.favicon}
          alt="favicon"
          width={16}
          height={16}
          className="rounded-sm"
        />
      ) : (
        <Globe className="size-4" />
      )}
      <span className="truncate text-left" data-tab-title>
        {displayTitle}
      </span>
      <button
        type="button"
        aria-label="Close tab"
        className="ml-1 rounded p-0.5 opacity-70 hover:bg-foreground/10 hover:opacity-100 focus-visible:ring-2 focus-visible:ring-primary/40"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <X className="size-3.5" />
      </button>
      {/* Underline removed for simplicity; background + weight indicate active state */}
    </button>
  );
}
