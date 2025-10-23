import type { FSNode } from "../../fs";
import { FileIcon } from "../file-icon";

interface GridItemProps {
  node: FSNode;
  selected: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
}

export function GridItem({
  node,
  selected,
  onClick,
  onDoubleClick,
}: GridItemProps) {
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
