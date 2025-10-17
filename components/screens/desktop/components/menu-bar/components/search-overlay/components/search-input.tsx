"use client";

import { Search } from "lucide-react";
import { motion } from "motion/react";

import { Input } from "@/components/ui/input";

type SearchInputProps = {
  query: string;
  onQueryChange: (query: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
};

export function SearchInput({
  query,
  onQueryChange,
  onSubmit,
  onKeyDown,
}: SearchInputProps) {
  return (
    <form onSubmit={onSubmit} className="relative">
      <motion.div
        layout
        className="relative flex items-center gap-3 px-4 py-2.5 bg-white/20 backdrop-blur-[64px] rounded-full"
      >
        <div className="flex size-10 shrink-0 items-center justify-center">
          <Search className="size-[1.25rem] text-slate-400" />
        </div>
        <Input
          autoFocus
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Spotlight Search"
          className="min-w-0 flex-1 border-0 bg-transparent px-0 text-[1.125rem] font-normal text-slate-900 placeholder:text-slate-400 focus-visible:border-0 focus-visible:ring-0"
          aria-label="Spotlight Search"
          onKeyDown={onKeyDown}
        />
      </motion.div>
    </form>
  );
}
