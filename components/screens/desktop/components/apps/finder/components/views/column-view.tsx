import { ChevronRight } from "lucide-react";
import { useMemo } from "react";
import type { FSNode, FSPath } from "../../fs";
import { FS, findNodeByPath, isFolder } from "../../fs";
import { FileIcon } from "../file-icon";

interface ColumnViewProps {
  path: FSPath;
  items: FSNode[];
  selected: string | null;
  onSelect: (id: string) => void;
  onNavigate: (path: FSPath) => void;
}

export function ColumnView({
  path,
  selected,
  onSelect,
  onNavigate,
}: ColumnViewProps) {
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
          className="flex h-full min-w-[220px] flex-col border-r border-white/12 "
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
