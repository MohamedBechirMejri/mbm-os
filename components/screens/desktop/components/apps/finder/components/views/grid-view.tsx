import type { FSNode } from "../../fs";
import { GridItem } from "../items/grid-item";

interface GridViewProps {
  items: FSNode[];
  selected: string | null;
  onItemClick: (node: FSNode) => void;
  onItemDoubleClick: (node: FSNode) => void;
}

export function GridView({
  items,
  selected,
  onItemClick,
  onItemDoubleClick,
}: GridViewProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3 p-4">
      {items.map((node) => (
        <GridItem
          key={node.id}
          node={node}
          selected={selected === node.id}
          onClick={() => onItemClick(node)}
          onDoubleClick={() => onItemDoubleClick(node)}
        />
      ))}
    </div>
  );
}
