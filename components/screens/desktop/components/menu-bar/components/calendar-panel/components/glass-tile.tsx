import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const tileBase = "relative overflow-hidden rounded-3xl backdrop-blur-[1.4px] p-4";

type GlassTileProps = {
  children: ReactNode;
  className?: string;
};

export function GlassTile({ children, className }: GlassTileProps) {
  return (
    <div className={cn(tileBase, className)}>
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
