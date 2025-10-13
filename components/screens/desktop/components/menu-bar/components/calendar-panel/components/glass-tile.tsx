import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

const tileBase =
  "relative overflow-hidden rounded-3xl border border-white/12 bg-[linear-gradient(145deg,rgba(255,255,255,0.35)_0%,rgba(255,255,255,0.12)_45%,rgba(92,139,255,0.08)_100%)] p-5 shadow-[0_1.25rem_2.75rem_rgba(15,23,42,0.36)] backdrop-blur-3xl";

type GlassTileProps = {
  children: ReactNode;
  className?: string;
};

export function GlassTile({ children, className }: GlassTileProps) {
  return (
    <div className={cn(tileBase, className)}>
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] border border-white/10" />
      <div className="pointer-events-none absolute -top-16 left-6 h-32 w-32 rounded-full bg-white/20 blur-3xl" />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
