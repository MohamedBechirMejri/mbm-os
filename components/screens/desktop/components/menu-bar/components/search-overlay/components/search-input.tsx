"use client";

import { Search } from "lucide-react";

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
      <div className="relative flex items-center gap-2.5 px-3.5 py-2 bg-white/30 backdrop-blur-[64px] rounded-full shadow-[inset_0_0.5px_1px_rgba(255,255,255,0.5),inset_0_-0.5px_1px_rgba(0,0,0,0.05)]">
        <div className="flex size-9 shrink-0 items-center justify-center">
          <Search
            className="size-[1.125rem] text-slate-600/80"
            strokeWidth={2.25}
          />
        </div>
        <Input
          autoFocus
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Spotlight Search"
          className="min-w-0 flex-1 border-0 bg-transparent px-0 text-[1.0625rem] font-medium text-slate-900 placeholder:text-slate-500/70 focus-visible:border-0 focus-visible:ring-0"
          aria-label="Spotlight Search"
          onKeyDown={onKeyDown}
        />
      </div>
    </form>
  );
}
