"use client";

import {
  ChevronLeft,
  ChevronRight,
  Columns3,
  Eye,
  EyeOff,
  Grid2X2,
  List,
  Search,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import GlassSurface from "@/components/ui/glass-surface";
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
import type { FSFile, FSNode, FSPath } from "./fs";
import { FS, findNodeByPath, getBreadcrumbs, isFile, isFolder } from "./fs";
import { QuickLook } from "./quicklook";

type ViewMode = "grid" | "list" | "columns";

const LIST_GRID_TEMPLATE =
  "grid grid-cols-[minmax(220px,1.6fr)_minmax(170px,1fr)_minmax(120px,0.8fr)_minmax(140px,0.9fr)]";
const LIST_ROW_CLASSES = `${LIST_GRID_TEMPLATE} items-center gap-3 px-4 py-2`;

export function FinderApp({ instanceId: _ }: { instanceId: string }) {
  const [path, setPath] = useState<FSPath>([]);
  const [view, setView] = useState<ViewMode>("list");
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [showPreview, setShowPreview] = useState(true);
  const [quickLookFile, setQuickLookFile] = useState<FSFile | null>(null);

  const folder = useMemo(() => findNodeByPath(FS, path), [path]);
  const crumbs = useMemo(() => getBreadcrumbs(FS, path), [path]);
  const items = useMemo(() => {
    const base = folder.children.filter((node) => !node.hidden);
    if (!query.trim()) return base;
    const q = query.toLowerCase();
    return base.filter((n) => (n as FSNode).name.toLowerCase().includes(q));
  }, [folder, query]);

  const selectedNode = useMemo(() => {
    if (!selected) return null;
    return items.find((n) => n.id === selected) || null;
  }, [selected, items]);

  const openFolder = useCallback(
    (id: string) => {
      const node = folder.children.find(
        (c) => c.id === id && c.type === "folder",
      );
      if (!node) return;
      setPath((prev) => [...prev, id]);
      setSelected(null);
    },
    [folder.children],
  );

  const goUp = useCallback(() => {
    setPath((prev) => prev.slice(0, -1));
    setSelected(null);
  }, []);

  const handleNavigate = useCallback((newPath: FSPath) => {
    setPath(newPath);
    setSelected(null);
  }, []);

  const handleItemClick = useCallback((node: FSNode) => {
    setSelected(node.id);
  }, []);

  const handleItemDoubleClick = useCallback(
    (node: FSNode) => {
      if (isFolder(node)) {
        openFolder(node.id);
      } else if (isFile(node)) {
        setQuickLookFile(node as FSFile);
      }
    },
    [openFolder],
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in search
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;

      // Space: Quick Look
      if (e.key === " " && selected) {
        e.preventDefault();
        const node = selectedNode;
        if (node && isFile(node)) {
          setQuickLookFile(node as FSFile);
        }
      }

      // Enter: Open folder or file
      if (e.key === "Enter" && selected) {
        const node = selectedNode;
        if (node && isFolder(node)) {
          openFolder(node.id);
        } else if (node && isFile(node)) {
          setQuickLookFile(node as FSFile);
        }
      }

      // Backspace or Cmd+Up: Go up
      if (e.key === "Backspace" || (e.key === "ArrowUp" && e.metaKey)) {
        e.preventDefault();
        goUp();
      }

      // Escape: Deselect
      if (e.key === "Escape") {
        setSelected(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selected, selectedNode, openFolder, goUp]);

  const currentCrumb = crumbs.at(-1);
  const handleCrumbNavigate = useCallback(
    (index: number) => {
      if (index === crumbs.length - 1) return;
      setPath(
        index === 0 ? [] : crumbs.slice(1, index + 1).map((crumb) => crumb.id),
      );
      setSelected(null);
    },
    [crumbs],
  );

  const statusLabel = `${items.length} item${items.length === 1 ? "" : "s"}`;
  const selectionKind = selectedNode ? getKindLabel(selectedNode) : null;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#080a10] text-white">
      {/* Titlebar toolbar */}
      <TitlebarPortal>
        <div className="pointer-events-none w-full px-4 pt-[1.1rem]">
          <GlassSurface
            width="100%"
            height="auto"
            borderRadius={26}
            blur={18}
            saturation={1.55}
            brightness={48}
            opacity={0.9}
            className="pointer-events-auto w-full !overflow-visible shadow-[0_24px_48px_rgba(6,8,18,0.42)]"
            containerClassName="!p-0 flex w-full items-center justify-between gap-4 rounded-[inherit] px-4 py-[0.85rem] text-[0.8125rem]"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex items-center gap-[0.35rem] rounded-full bg-white/12 px-1.5 py-[0.2rem]">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7 rounded-full text-white/90 hover:bg-white/18 disabled:opacity-30"
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
                        className="size-7 rounded-full text-white/55 hover:bg-white/18 disabled:opacity-30"
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

              <div className="hidden min-w-0 items-center gap-2 rounded-[1.1rem] bg-white/10 px-3 py-[0.45rem] md:flex">
                {currentCrumb ? (
                  <>
                    <FileIcon node={folder} size={20} />
                    <span className="truncate text-[0.8125rem] font-medium text-white/85">
                      {currentCrumb.name}
                    </span>
                  </>
                ) : (
                  <span className="text-white/65">Finder</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 rounded-[0.9rem] bg-white/10 p-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant={view === "grid" ? "default" : "ghost"}
                    className="size-7 rounded-md"
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
                    className="size-7 rounded-md"
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
                    className="size-7 rounded-md"
                    aria-label="Column view"
                    onClick={() => setView("columns")}
                  >
                    <Columns3 className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Column view</TooltipContent>
              </Tooltip>
            </div>

            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant={showPreview ? "default" : "ghost"}
                    className="size-7 rounded-[0.85rem]"
                    aria-label="Toggle preview"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    {showPreview ? (
                      <Eye className="size-3.5" />
                    ) : (
                      <EyeOff className="size-3.5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {showPreview ? "Hide preview" : "Show preview"}
                </TooltipContent>
              </Tooltip>
              <div className="relative w-[15.5rem] max-w-[40vw]">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-white/55" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search"
                  className="h-8 w-full rounded-[1.1rem] border border-white/12 bg-black/40 pl-9 text-[0.8125rem] text-white placeholder:text-white/55"
                />
              </div>
            </div>
          </GlassSurface>
        </div>
      </TitlebarPortal>

      {/* Body */}
      <div className="flex h-full w-full overflow-hidden">
        <Sidebar path={path} onNavigate={handleNavigate} />

        {/* Content */}
        <section className="relative flex-1 overflow-auto bg-[#10131a]">
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
            <div className="flex flex-col">
              <div
                className={`${LIST_GRID_TEMPLATE} sticky top-0 z-10 border-b border-white/8 bg-[#0f1218] px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-white/45`}
              >
                <span className="pl-9">Name</span>
                <span>Date Modified</span>
                <span className="pr-2 text-right">Size</span>
                <span>Kind</span>
              </div>

              <div className="flex flex-col">
                {items.map((node, index) => (
                  <ListItem
                    key={node.id}
                    node={node}
                    selected={selected === node.id}
                    onClick={() => handleItemClick(node)}
                    onDoubleClick={() => handleItemDoubleClick(node)}
                    isLast={index === items.length - 1}
                  />
                ))}

                {items.length === 0 && (
                  <div className="flex h-40 items-center justify-center px-4 text-sm text-white/40">
                    No items to display
                  </div>
                )}
              </div>
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

      <footer className="flex items-center justify-between gap-4 border-t border-white/10 bg-[#0f1117] px-4 py-2 text-[12px] text-white/65">
        <div className="flex min-w-0 items-center gap-1 overflow-hidden">
          {crumbs.map((crumb, index) => (
            <div key={crumb.id} className="flex min-w-0 items-center">
              <button
                type="button"
                onClick={() => handleCrumbNavigate(index)}
                className={`truncate rounded-md px-2 py-1 transition-colors ${
                  index === crumbs.length - 1
                    ? "cursor-default bg-white/12 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
                disabled={index === crumbs.length - 1}
              >
                {crumb.name}
              </button>
              {index < crumbs.length - 1 && (
                <ChevronRight className="mx-1 size-3 text-white/30" />
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 text-white/60">
          {selectedNode && selectionKind ? (
            <>
              <FileIcon node={selectedNode} size={18} />
              <span className="max-w-[220px] truncate text-white/85">
                {selectedNode.name}
              </span>
              <span className="hidden sm:inline text-white/45">
                {selectionKind}
              </span>
            </>
          ) : (
            <span>{statusLabel}</span>
          )}
        </div>
      </footer>

      {/* Quick Look */}
      <QuickLook file={quickLookFile} onClose={() => setQuickLookFile(null)} />
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
  isLast: boolean;
}

function ListItem({
  node,
  selected,
  onClick,
  onDoubleClick,
  isLast,
}: ListItemProps) {
  const modifiedLabel = node.modified ?? "--";
  const sizeLabel = getSizeLabel(node);
  const kindLabel = getKindLabel(node);

  return (
    <button
      type="button"
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={`${LIST_ROW_CLASSES} cursor-default select-none border-b border-white/6 text-left transition-colors ${
        selected
          ? "bg-blue-500/15 text-white/95 ring-1 ring-blue-400/40"
          : "hover:bg-white/8"
      } ${isLast ? "border-b-0" : ""}`}
    >
      <div className="flex items-center gap-3">
        <FileIcon node={node} size={28} />
        <span className="truncate text-[13px] text-white/90">{node.name}</span>
      </div>
      <span className="truncate text-[12px] text-white/60">
        {modifiedLabel}
      </span>
      <span className="pr-2 text-right text-[12px] text-white/60">
        {sizeLabel || "--"}
      </span>
      <span className="truncate text-[12px] text-white/60">{kindLabel}</span>
    </button>
  );
}

function getSizeLabel(node: FSNode): string {
  if (node.sizeLabel) return node.sizeLabel;
  if (isFile(node) && node.size) {
    return formatBytes(node.size);
  }
  return "";
}

function getKindLabel(node: FSNode): string {
  if (node.kindLabel) return node.kindLabel;
  if (isFolder(node)) return "Folder";

  if (!isFile(node)) return "File";

  const labels: Record<FSFile["kind"], string> = {
    image: "Image",
    video: "Video",
    audio: "Audio",
    text: "Plain Text",
    pdf: "PDF Document",
    other: "Application",
  };

  return labels[node.kind] ?? "File";
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = bytes / k ** i;
  return `${Math.round(size * 100) / 100} ${sizes[i]}`;
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
        cols.push(node.children.filter((child) => !child.hidden));
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
          className="flex h-full min-w-[220px] flex-col border-r border-white/12 bg-[#0f1117]"
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
                className={`flex items-center gap-2 border-b border-white/5 px-4 py-2 text-left transition-colors ${
                  isSelected
                    ? "bg-blue-500/15 text-white"
                    : "text-white/70 hover:bg-white/8 hover:text-white"
                }`}
              >
                <FileIcon node={node} size={22} />
                <span className="flex-1 truncate text-[12px] leading-none">
                  {node.name}
                </span>
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
