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
      <div className="relative flex items-center gap-3 px-4 py-2.5 rounded-full border border-white/75 bg-gradient-to-br from-white/95 via-white/90 to-white/70 backdrop-blur-[48px] shadow-[0_12px_32px_rgba(15,23,42,0.12),inset_0_1px_rgba(255,255,255,0.85)]">
        <div className="flex size-10 shrink-0 items-center justify-center">
          <Search
            className="size-[1.25rem] text-slate-500"
            strokeWidth={2.25}
          />
        </div>
        <Input
          autoFocus
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Spotlight Search"
          className="min-w-0 flex-1 border-0 bg-transparent px-0 text-[1.125rem] font-semibold text-slate-900 placeholder:text-slate-500 focus-visible:border-0 focus-visible:ring-0"
          aria-label="Spotlight Search"
          onKeyDown={onKeyDown}
        />
      </div>
    </form>
  );
}
