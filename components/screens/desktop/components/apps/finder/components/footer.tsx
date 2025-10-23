import { ChevronRight } from "lucide-react";
import type { FSNode } from "../fs";
import { getKindLabel } from "../utils";
import { FileIcon } from "./file-icon";

interface FooterProps {
  crumbs: Array<{ id: string; name: string }>;
  items: FSNode[];
  selectedNode: FSNode | null;
  onCrumbNavigate: (index: number) => void;
}

export function Footer({
  crumbs,
  items,
  selectedNode,
  onCrumbNavigate,
}: FooterProps) {
  const statusLabel = `${items.length} item${items.length === 1 ? "" : "s"}`;
  const selectionKind = selectedNode ? getKindLabel(selectedNode) : null;

  return (
    <footer className="flex items-center justify-between gap-4 border-t border-white/10 bg-[#0f1117] px-4 py-2 text-[12px] text-white/65">
      <div className="flex min-w-0 items-center gap-1 overflow-hidden">
        {crumbs.map((crumb, index) => (
          <div key={crumb.id} className="flex min-w-0 items-center">
            <button
              type="button"
              onClick={() => onCrumbNavigate(index)}
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
  );
}
