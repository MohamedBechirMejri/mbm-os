"use client";

import { cn } from "@/lib/utils";
import type { ShapeBuilderState } from "./use-shape-builder";

interface PreviewPanelProps {
  state: ShapeBuilderState;
}

export function PreviewPanel({ state }: PreviewPanelProps) {
  const { cssCode } = state;

  // Extract just the shape() part for clip-path
  const clipPathValue = cssCode.replace("clip-path: ", "").replace(";", "");

  return (
    <div className="flex flex-col gap-4 p-4 border-l border-white/10 bg-black/20 backdrop-blur-xl w-64">
      <span className="text-xs font-medium text-white/70">Live Preview</span>

      {/* Preview container */}
      <div className="relative aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-white/5 to-white/10">
        {/* Checkerboard background for transparency */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%),
              linear-gradient(-45deg, rgba(255,255,255,0.05) 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.05) 75%),
              linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.05) 75%)
            `,
            backgroundSize: "16px 16px",
            backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0",
          }}
        />

        {/* Clipped preview element */}
        <div
          className="absolute inset-4 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"
          style={{
            clipPath: clipPathValue,
          }}
        />
      </div>

      {/* Alternative previews */}
      <div className="grid grid-cols-2 gap-2">
        <PreviewVariant
          label="Solid"
          clipPath={clipPathValue}
          className="bg-white"
        />
        <PreviewVariant
          label="Image"
          clipPath={clipPathValue}
          className="bg-gradient-to-br from-cyan-400 to-emerald-400"
        />
        <PreviewVariant
          label="Dark"
          clipPath={clipPathValue}
          className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/20"
        />
        <PreviewVariant
          label="Glass"
          clipPath={clipPathValue}
          className="bg-white/10 backdrop-blur-sm border border-white/20"
        />
      </div>

      {/* Usage hint */}
      <div className="mt-auto p-3 rounded-lg bg-white/5 border border-white/10">
        <p className="text-[10px] text-white/50 leading-relaxed">
          <span className="text-white/70 font-medium">Tip:</span> Apply the
          generated CSS to any element&apos;s{" "}
          <code className="text-cyan-400">clip-path</code> property to create
          this shape.
        </p>
      </div>
    </div>
  );
}

// Small preview variant component
function PreviewVariant({
  label,
  clipPath,
  className,
}: {
  label: string;
  clipPath: string;
  className: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[9px] text-white/40 uppercase">{label}</span>
      <div className="relative aspect-square rounded overflow-hidden bg-white/5">
        <div
          className={cn("absolute inset-1", className)}
          style={{ clipPath }}
        />
      </div>
    </div>
  );
}
