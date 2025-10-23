import type { FSNode } from "../../fs";
import { getKindLabel, getSizeLabel, LIST_ROW_CLASSES } from "../../utils";
import { FileIcon } from "../file-icon";

interface ListItemProps {
  node: FSNode;
  selected: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
  isLast: boolean;
}

export function ListItem({
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
