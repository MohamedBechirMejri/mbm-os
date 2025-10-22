"use client";

import { BookOpen, Globe, X } from "lucide-react";
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
    <div className="relative z-[1] flex items-center gap-2 overflow-x-auto bg-white/5 backdrop-blur-md supports-[backdrop-filter]:bg-white/10">
      <div className="flex min-w-max items-center gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={cn(
              "group relative flex max-w-[16rem] items-center gap-2 rounded-xl px-4 py-1.5 text-[0.9rem] text-white/85",
              t.id === activeId
                ? "bg-white/15 shadow-[0_6px_20px_-12px_rgba(0,0,0,0.8)]"
                : "hover:bg-white/10",
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
            {t.mode === "reader" ? (
              <span className="flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2 py-[0.1rem] text-[0.75rem] text-white/75">
                <BookOpen className="size-3" />
                Reader
              </span>
            ) : null}
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
