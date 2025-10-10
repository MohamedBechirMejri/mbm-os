"use client";

import {
  ChevronLeft,
  ChevronRight,
  Columns3,
  Grid2X2,
  List,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TitlebarPortal } from "../../window-manager/components/window-view/titlebar-portal";
import { FileIcon } from "./components/file-icon";
import { PreviewPanel } from "./components/preview-panel";
import { Sidebar } from "./components/sidebar";
import type { FSNode, FSPath } from "./fs";
import { FS, findNodeByPath, getBreadcrumbs, isFile, isFolder } from "./fs";

type ViewMode = "grid" | "list" | "columns";

export function FinderApp({ instanceId: _ }: { instanceId: string }) {
  const [path, setPath] = useState<FSPath>([]);
  const [view, setView] = useState<ViewMode>("grid");
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [showPreview] = useState(true);

  const folder = useMemo(() => findNodeByPath(FS, path), [path]);
  const crumbs = useMemo(() => getBreadcrumbs(FS, path), [path]);
  const items = useMemo(() => {
    const base = folder.children;
    if (!query.trim()) return base;
    const q = query.toLowerCase();
    return base.filter((n) => (n as FSNode).name.toLowerCase().includes(q));
  }, [folder, query]);

  const selectedNode = useMemo(() => {
    if (!selected) return null;
    return items.find((n) => n.id === selected) || null;
  }, [selected, items]);

  function openFolder(id: string) {
    const node = folder.children.find(
      (c) => c.id === id && c.type === "folder",
    );
    if (!node) return;
    setPath((prev) => [...prev, id]);
    setSelected(null);
  }

  function goUp() {
    setPath((prev) => prev.slice(0, -1));
    setSelected(null);
  }

  function handleNavigate(newPath: FSPath) {
    setPath(newPath);
    setSelected(null);
  }

  function handleItemClick(node: FSNode) {
    setSelected(node.id);
  }

  function handleItemDoubleClick(node: FSNode) {
    if (isFolder(node)) {
      openFolder(node.id);
    }
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* Titlebar toolbar */}
      <TitlebarPortal>
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 w-full py-1.5 px-2">
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-7 rounded-full text-white/90 hover:bg-white/10 disabled:opacity-30"
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
                    className="size-7 rounded-full text-white/90 hover:bg-white/10 disabled:opacity-30"
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
                    className="truncate rounded-md px-2 py-1 hover:bg-white/10 transition-colors"
                    onClick={() =>
                      setPath(
                        i === 0 ? [] : crumbs.slice(1, i + 1).map((x) => x.id),
                      )
                    }
                  >
                    {c.name}
                  </button>
                  {i < crumbs.length - 1 ? (
                    <span className="text-white/30">›</span>
                  ) : null}
                </div>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-1 rounded-lg bg-white/5 p-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant={view === "grid" ? "default" : "ghost"}
                    className="size-6 rounded-md"
                    aria-label="Grid view"
                    onClick={() => setView("grid")}
                  >
                    <Grid2X2 className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Grid view</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant={view === "list" ? "default" : "ghost"}
                    className="size-6 rounded-md"
                    aria-label="List view"
                    onClick={() => setView("list")}
                  >
                    <List className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>List view</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant={view === "columns" ? "default" : "ghost"}
                    className="size-6 rounded-md"
                    aria-label="Column view"
                    onClick={() => setView("columns")}
                  >
                    <Columns3 className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Column view</TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-[14rem] max-w-[40vw]">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-white/50" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                className="h-7 w-full rounded-lg bg-black/20 pl-8 text-[13px] text-white placeholder:text-white/50 border-white/10"
              />
            </div>
          </div>
        </div>
      </TitlebarPortal>

      {/* Body */}
      <div className="flex h-full w-full overflow-hidden">
        <Sidebar path={path} onNavigate={handleNavigate} />

        {/* Content */}
        <section className="relative flex-1 overflow-auto">
          {view === "grid" && (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3 p-4">
              {items.map((node) => (
                <GridItem
                  key={node.id}
                  node={node}
                  selected={selected === node.id}
                  onClick={() => handleItemClick(node)}
                  onDoubleClick={() => handleItemDoubleClick(node)}
                />
              ))}
            </div>
          )}

          {view === "list" && (
            <div className="flex flex-col p-2">
              {items.map((node) => (
                <ListItem
                  key={node.id}
                  node={node}
                  selected={selected === node.id}
                  onClick={() => handleItemClick(node)}
                  onDoubleClick={() => handleItemDoubleClick(node)}
                />
              ))}
            </div>
          )}

          {view === "columns" && (
            <ColumnView
              path={path}
              items={items}
              selected={selected}
              onSelect={setSelected}
              onNavigate={handleNavigate}
            />
          )}
        </section>

        {showPreview && <PreviewPanel node={selectedNode} />}
      </div>
    </div>
  );
}

interface GridItemProps {
  node: FSNode;
  selected: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
}

function GridItem({ node, selected, onClick, onDoubleClick }: GridItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={`flex cursor-default select-none flex-col items-center gap-2 rounded-xl p-3 transition-all ${
        selected
          ? "bg-gradient-to-br from-blue-500/20 to-blue-600/20 ring-1 ring-blue-400/40 shadow-lg shadow-blue-500/10"
          : "hover:bg-white/5"
      }`}
    >
      <FileIcon node={node} size={64} />
      <div
        className="w-full truncate text-center text-[11px] text-white/90 leading-tight"
        title={node.name}
      >
        {node.name}
      </div>
    </button>
  );
}

interface ListItemProps {
  node: FSNode;
  selected: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
}

function ListItem({ node, selected, onClick, onDoubleClick }: ListItemProps) {
  const file = isFile(node) ? node : null;

  return (
    <button
      type="button"
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={`grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg px-3 py-2 text-left transition-all ${
        selected
          ? "bg-gradient-to-r from-blue-500/15 to-blue-600/10 ring-1 ring-blue-400/30"
          : "hover:bg-white/5"
      }`}
    >
      <FileIcon node={node} size={32} />
      <div className="truncate text-[13px] text-white/90">{node.name}</div>
      <div className="text-[11px] text-white/40 capitalize">
        {isFolder(node) ? "Folder" : file?.kind || "File"}
      </div>
    </button>
  );
}

interface ColumnViewProps {
  path: FSPath;
  items: FSNode[];
  selected: string | null;
  onSelect: (id: string) => void;
  onNavigate: (path: FSPath) => void;
}

function ColumnView({ path, selected, onSelect, onNavigate }: ColumnViewProps) {
  const columns: FSNode[][] = useMemo(() => {
    const cols: FSNode[][] = [];
    let currentPath: FSPath = [];

    // Build column hierarchy
    for (let i = 0; i <= path.length; i++) {
      const node = findNodeByPath(FS, currentPath);
      if (node.type === "folder") {
        cols.push(node.children);
      }
      if (i < path.length) {
        currentPath = [...currentPath, path[i]];
      }
    }

    return cols;
  }, [path]);

  return (
    <div className="flex h-full overflow-x-auto">
      {columns.map((columnItems, columnIndex) => (
        <div
          key={`col-${columnIndex}-${path[columnIndex] || "root"}`}
          className="flex h-full min-w-[200px] flex-col border-r border-white/10 bg-gradient-to-b from-white/5 to-transparent"
        >
          {columnItems.map((node) => {
            const isSelected =
              path[columnIndex] === node.id || selected === node.id;

            return (
              <button
                key={node.id}
                type="button"
                onClick={() => {
                  if (isFolder(node)) {
                    const newPath = path.slice(0, columnIndex);
                    newPath.push(node.id);
                    onNavigate(newPath);
                  }
                  onSelect(node.id);
                }}
                className={`flex items-center gap-2 border-b border-white/5 px-3 py-2 text-left transition-all ${
                  isSelected
                    ? "bg-blue-500/20 text-white/95"
                    : "text-white/70 hover:bg-white/5 hover:text-white/90"
                }`}
              >
                <FileIcon node={node} size={20} />
                <span className="flex-1 truncate text-[12px]">{node.name}</span>
                {isFolder(node) && (
                  <ChevronRight className="size-3 text-white/40" />
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default FinderApp;
