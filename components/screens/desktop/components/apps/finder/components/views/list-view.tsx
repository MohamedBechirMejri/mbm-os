import type { FSNode } from "../../fs";
import { LIST_GRID_TEMPLATE } from "../../utils";
import { ListItem } from "../items/list-item";

interface ListViewProps {
  items: FSNode[];
  selected: string | null;
  onItemClick: (node: FSNode) => void;
  onItemDoubleClick: (node: FSNode) => void;
}

export function ListView({
  items,
  selected,
  onItemClick,
  onItemDoubleClick,
}: ListViewProps) {
  return (
    <div className="flex flex-col h-full">
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
            onClick={() => onItemClick(node)}
            onDoubleClick={() => onItemDoubleClick(node)}
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
  );
}
