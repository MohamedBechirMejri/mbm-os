"use client";

import { Globe, X } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Tab } from "./types";

type Props = {
  tabs: Tab[];
  activeId: string;
  onSetActive: (id: string) => void;
  onClose: (id: string) => void;
};

export function TabsStrip({ tabs, activeId, onSetActive, onClose }: Props) {
  return (
    <div className="relative z-[1] flex items-center gap-2 overflow-x-auto border-b border-border/60 bg-background/50 px-2 py-1.5 backdrop-blur supports-[backdrop-filter]:bg-background/20">
      <div className="flex min-w-max items-center gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={cn(
              "group relative flex max-w-[16rem] items-center gap-2 rounded-md px-3 py-1.5 text-[0.9rem]",
              t.id === activeId ? "bg-foreground/10" : "hover:bg-foreground/5",
            )}
            type="button"
            onClick={() => onSetActive(t.id)}
            title={t.title}
          >
            {t.favicon ? (
              <Image
                src={t.favicon}
                alt="favicon"
                width={16}
                height={16}
                className="rounded-sm"
              />
            ) : (
              <Globe className="size-4" />
            )}
            <span className="truncate">
              {(() => {
                if (t.title) return t.title;
                try {
                  return new URL(t.url).hostname;
                } catch {
                  return t.url;
                }
              })()}
            </span>
            <button
              className="ml-1 rounded p-0.5 opacity-70 hover:bg-foreground/10 hover:opacity-100"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose(t.id);
              }}
              aria-label="Close tab"
            >
              <X className="size-3.5" />
            </button>
            {t.id === activeId ? (
              <motion.span
                layoutId="safari-tab-underline"
                className="absolute inset-x-2 -bottom-[2px] h-[2px] rounded-full bg-foreground/50"
              />
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}
