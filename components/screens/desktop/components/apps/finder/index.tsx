"use client";

import { useCallback, useMemo, useState } from "react";
import { Footer } from "./components/footer";
import { PreviewPanel } from "./components/preview-panel";
import { Sidebar } from "./components/sidebar";
import { Toolbar } from "./components/toolbar";
import { ColumnView } from "./components/views/column-view";
import { GridView } from "./components/views/grid-view";
import { ListView } from "./components/views/list-view";
import type { FSFile, FSNode, FSPath } from "./fs";
import { FS, findNodeByPath, getBreadcrumbs, isFile, isFolder } from "./fs";
import { useFinderKeyboard } from "./hooks/use-finder-keyboard";
import { QuickLook } from "./quicklook";
import type { ViewMode } from "./types";

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

  useFinderKeyboard({
    selected,
    selectedNode,
    onOpenFolder: openFolder,
    onGoUp: goUp,
    onDeselect: () => setSelected(null),
    onQuickLook: setQuickLookFile,
  });

  const currentCrumb = crumbs.at(-1);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#1E1E1E] text-white">
      <Toolbar
        folder={folder}
        currentCrumb={currentCrumb}
        path={path}
        view={view}
        showPreview={showPreview}
        query={query}
        onGoUp={goUp}
        onViewChange={setView}
        onPreviewToggle={() => setShowPreview(!showPreview)}
        onQueryChange={setQuery}
      />

      <div className="flex h-full w-full overflow-hidden">
        <Sidebar path={path} onNavigate={handleNavigate} />

        <section className="relative flex-1 overflow-auto pt-14 flex-col flex">
          {view === "grid" && (
            <GridView
              items={items}
              selected={selected}
              onItemClick={handleItemClick}
              onItemDoubleClick={handleItemDoubleClick}
            />
          )}
          {view === "list" && (
            <ListView
              items={items}
              selected={selected}
              onItemClick={handleItemClick}
              onItemDoubleClick={handleItemDoubleClick}
            />
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

          <Footer
            crumbs={crumbs}
            items={items}
            selectedNode={selectedNode}
            onCrumbNavigate={handleCrumbNavigate}
          />
        </section>

        {showPreview && <PreviewPanel node={selectedNode} />}
      </div>

      <QuickLook file={quickLookFile} onClose={() => setQuickLookFile(null)} />
    </div>
  );
}

export default FinderApp;
