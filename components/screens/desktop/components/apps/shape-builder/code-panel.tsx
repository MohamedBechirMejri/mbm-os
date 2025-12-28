"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import { useState, useCallback } from "react";
import type { ShapeBuilderState } from "./use-shape-builder";

interface CodePanelProps {
  state: ShapeBuilderState;
}

export function CodePanel({ state }: CodePanelProps) {
  const { cssCode } = state;
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(cssCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = cssCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [cssCode]);

  return (
    <div className="flex flex-col border-t border-white/10 bg-black/30 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
        <span className="text-xs font-medium text-white/70">Generated CSS</span>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 gap-1.5 text-xs transition-all",
            copied
              ? "text-green-400 hover:text-green-400"
              : "text-white/60 hover:text-white"
          )}
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="size-3.5" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              Copy
            </>
          )}
        </Button>
      </div>

      {/* Code area */}
      <div className="p-4 overflow-auto max-h-48">
        <pre className="text-xs font-mono leading-relaxed">
          <code className="text-white/80">{highlightCss(cssCode)}</code>
        </pre>
      </div>

      {/* Browser support warning */}
      <div className="px-4 py-2 border-t border-white/10 bg-amber-500/10">
        <p className="text-[10px] text-amber-400/80">
          ⚠️ CSS shape() is new — works in Chrome 133+, Firefox behind flag
        </p>
      </div>
    </div>
  );
}

// Simple CSS syntax highlighting (good enough for our use case)
function highlightCss(code: string): React.ReactNode {
  // Split code into parts and apply colors
  const parts: React.ReactNode[] = [];
  let key = 0;

  // Match property, values, and punctuation
  const regex =
    /(clip-path:|shape\(|from|to|by|line|hline|vline|curve|arc|smooth|move|close|with|of|cw|ccw|large|small|rotate|\d+(?:\.\d+)?(?:px|%|deg)?|[(),;\n])/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(code)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(
        <span key={key++} className="text-white/50">
          {code.slice(lastIndex, match.index)}
        </span>
      );
    }

    const token = match[0];

    // Determine token type and color
    let className = "text-white/70";
    if (token === "clip-path:") {
      className = "text-cyan-400";
    } else if (token === "shape(") {
      className = "text-purple-400";
    } else if (["from", "to", "by", "with", "of", "rotate"].includes(token)) {
      className = "text-orange-400";
    } else if (
      [
        "line",
        "hline",
        "vline",
        "curve",
        "arc",
        "smooth",
        "move",
        "close",
      ].includes(token)
    ) {
      className = "text-green-400";
    } else if (["cw", "ccw", "large", "small"].includes(token)) {
      className = "text-yellow-400";
    } else if (/^\d/.test(token)) {
      className = "text-blue-400";
    } else if (["(", ")", ",", ";"].includes(token)) {
      className = "text-white/40";
    }

    parts.push(
      <span key={key++} className={className}>
        {token}
      </span>
    );

    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < code.length) {
    parts.push(
      <span key={key++} className="text-white/50">
        {code.slice(lastIndex)}
      </span>
    );
  }

  return <>{parts}</>;
}
