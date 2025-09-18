"use client";

import { ChevronLeft, ChevronRight, Grid2X2, List, Search } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TitlebarPortal } from "../../window-manager/components/window-view/titlebar-portal";
import type { FSFile, FSFolder, FSNode, FSPath } from "./fs";
import { FS, findNodeByPath, getBreadcrumbs, isFile, isFolder } from "./fs";
import { QuickLook } from "./quicklook";

type ViewMode = "grid" | "list";

function useKey(handler: (e: KeyboardEvent) => void) {
  useEffect(() => {
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handler]);
}

export function FinderApp({ instanceId: _ }: { instanceId: string }) {
  const [path, setPath] = useState<FSPath>([]); // from root
  const [view, setView] = useState<ViewMode>("grid");
  const [selected, setSelected] = useState<string | null>(null);
  const [qlFile, setQlFile] = useState<ReturnType<typeof pickFile> | null>(
    null,
  );
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);

  const folder = useMemo(() => findNodeByPath(FS, path), [path]);
  const crumbs = useMemo(() => getBreadcrumbs(FS, path), [path]);
  const items = useMemo(() => {
    const base = folder.children;
    if (!query.trim()) return base;
    const q = query.toLowerCase();
    return base.filter((n) => (n as FSNode).name.toLowerCase().includes(q));
  }, [folder, query]);

  useKey((e) => {
    if ((e.target as HTMLElement | null)?.tagName === "INPUT") return;
    if (e.key === "Backspace") {
      e.preventDefault();
      goUp();
    }
    if (e.key === "ArrowLeft" && (e.metaKey || e.altKey)) {
      e.preventDefault();
      goUp();
    }
    if (e.key === "Enter" && selected) {
      const node = items.find((n) => n.id === selected);
      if (node && isFolder(node)) openFolder(node.id);
    }
    if (e.key === " ") {
      e.preventDefault();
      if (selected) {
        const file = pickFile(items, selected);
        if (file) setQlFile(file);
      }
    }
    if (e.key === "Escape") {
      setSelected(null);
    }
  });

  function pickFile(nodes: FSNode[], id: string) {
    const n = nodes.find((x) => x.id === id);
    return n && isFile(n) ? n : null;
  }

  function openFolder(id: string) {
    const node = folder.children.find(
      (c) => c.id === id && c.type === "folder",
    ) as FSFolder | undefined;
    if (!node) return;
    setPath((prev) => [...prev, id]);
    setSelected(null);
  }

  function goUp() {
    setPath((prev) => prev.slice(0, -1));
    setSelected(null);
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* Titlebar toolbar */}
      <TitlebarPortal>
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 w-full py-1.5">
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-7 rounded-full text-white/90 hover:bg-white/10"
                  onClick={goUp}
                  disabled={path.length === 0}
                  aria-label="Go Back"
                >
                  <ChevronLeft className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Go back</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7 rounded-full text-white/90 hover:bg-white/10"
                    disabled
                    aria-label="Go Forward"
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>Go forward</TooltipContent>
            </Tooltip>
          </div>

          <div className="flex min-w-0 items-center gap-2">
            <nav className="hidden md:flex min-w-0 items-center gap-1 text-[13px] text-white/80">
              {crumbs.map((c, i) => (
                <div key={c.id} className="flex items-center gap-1 min-w-0">
                  <button
                    type="button"
                    className="truncate rounded px-2 py-1 hover:bg-white/10"
                    onClick={() =>
                      setPath((_) =>
                        i === 0 ? [] : crumbs.slice(1, i + 1).map((x) => x.id),
                      )
                    }
                  >
                    {c.name}
                  </button>
                  {i < crumbs.length - 1 ? (
                    <span className="text-white/40">›</span>
                  ) : null}
                </div>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-1">
              <Button
                size="icon"
                variant={view === "grid" ? "default" : "ghost"}
                className="size-7 rounded-lg"
                aria-label="Grid view"
                onClick={() => setView("grid")}
              >
                <Grid2X2 className="size-4" />
              </Button>
              <Button
                size="icon"
                variant={view === "list" ? "default" : "ghost"}
                className="size-7 rounded-lg"
                aria-label="List view"
                onClick={() => setView("list")}
              >
                <List className="size-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-[18rem] max-w-[40vw]">
              <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-white/60" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                className="h-8 w-full rounded-lg bg-black/25 pl-8 text-white placeholder:text-white/60"
              />
            </div>
          </div>
        </div>
      </TitlebarPortal>

      {/* Body */}
      <div className="flex h-full w-full overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden md:flex w-52 flex-col gap-1 border-r border-white/10 bg-white/5 p-2 text-sm text-white/80">
          {[
            { id: "home", label: "Home", to: [] as FSPath },
            { id: "desktop", label: "Desktop", to: ["desktop"] as FSPath },
            {
              id: "documents",
              label: "Documents",
              to: ["documents"] as FSPath,
            },
            {
              id: "downloads",
              label: "Downloads",
              to: ["downloads"] as FSPath,
            },
            { id: "pictures", label: "Pictures", to: ["pictures"] as FSPath },
          ].map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setPath(s.to)}
              className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left hover:bg-white/10 ${
                JSON.stringify(path) === JSON.stringify(s.to)
                  ? "bg-white/10"
                  : ""
              }`}
            >
              <span>{s.label}</span>
            </button>
          ))}
        </aside>

        {/* Content */}
        <section
          ref={containerRef}
          className="relative flex-1 overflow-auto p-3"
        >
          {view === "grid" ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4">
              {items.map((n) => (
                <FileTile
                  key={n.id}
                  node={n}
                  selected={selected === n.id}
                  onOpen={() =>
                    isFolder(n)
                      ? openFolder(n.id)
                      : setQlFile(isFile(n) ? n : null)
                  }
                  onSelect={() => setSelected(n.id)}
                />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-white/10 rounded-lg bg-white/5">
              {items.map((n) => (
                <ListRow
                  key={n.id}
                  node={n}
                  selected={selected === n.id}
                  onOpen={() =>
                    isFolder(n)
                      ? openFolder(n.id)
                      : setQlFile(isFile(n) ? n : null)
                  }
                  onSelect={() => setSelected(n.id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <QuickLook file={qlFile} onClose={() => setQlFile(null)} />
    </div>
  );
}

function FileTile({
  node,
  selected,
  onOpen,
  onSelect,
}: {
  node: FSNode;
  selected: boolean;
  onOpen: () => void;
  onSelect: () => void;
}) {
  const isDir = isFolder(node);
  const thumb = isDir ? null : node.kind === "image" ? node.path : null;
  return (
    <button
      type="button"
      tabIndex={0}
      onDoubleClick={onOpen}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen();
        if (e.key === " ") onSelect();
      }}
      className={`flex cursor-default select-none flex-col items-center gap-2 rounded-lg p-2 ${selected ? "bg-white/15" : "hover:bg-white/10"}`}
    >
      <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-black/30">
        {thumb ? (
          <Image
            src={thumb}
            alt={node.name}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-white/50">
            {isDir ? "📁" : "📄"}
          </div>
        )}
      </div>
      <div
        className="w-full truncate text-center text-xs text-white/90"
        title={node.name}
      >
        {node.name}
      </div>
    </button>
  );
}

function ListRow({
  node,
  selected,
  onOpen,
  onSelect,
}: {
  node: FSNode;
  selected: boolean;
  onOpen: () => void;
  onSelect: () => void;
}) {
  const isDir = isFolder(node);
  return (
    <button
      type="button"
      onDoubleClick={onOpen}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen();
        if (e.key === " ") onSelect();
      }}
      className={`grid grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-2 text-left ${selected ? "bg-white/15" : "hover:bg-white/10"}`}
    >
      <div className="relative h-8 w-8 overflow-hidden rounded bg-black/30">
        {!isDir && node.kind === "image" ? (
          <Image
            src={(node as FSFile).path}
            alt={node.name}
            fill
            sizes="32px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-white/50">
            {isDir ? "📁" : "📄"}
          </div>
        )}
      </div>
      <div className="truncate text-sm text-white/90">{node.name}</div>
      <div className="text-xs text-white/50">
        {isDir ? "Folder" : (node as FSFile).kind}
      </div>
    </button>
  );
}

export default FinderApp;
