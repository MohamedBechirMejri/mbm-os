import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Copy, Check } from "lucide-react";

interface CodeBlockProps {
  label: string;
  code: string;
  onCopy: () => void;
}

export function CodeBlock({ label, code, onCopy }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-white/40 uppercase tracking-wider">
        {label}
      </Label>
      <div className="group relative rounded-md border border-white/5 bg-black/20 p-3 font-mono text-xs text-white/60 transition-colors hover:bg-black/30">
        <div className="truncate pr-8">{code}</div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      </div>
    </div>
  );
}
