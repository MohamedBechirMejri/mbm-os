import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
}

export function SearchBar({ query, onQueryChange }: SearchBarProps) {
  return (
    <div className="relative w-[15.5rem] max-w-[40vw]">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-white/55" />
      <Input
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Search"
        className="h-8 w-full rounded-[1.1rem] border border-white/12 bg-black/40 pl-9 text-[0.8125rem] text-white placeholder:text-white/55"
      />
    </div>
  );
}
