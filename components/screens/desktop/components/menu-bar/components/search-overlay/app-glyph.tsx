import { Square } from "lucide-react";
import Image from "next/image";

import type { AppMeta } from "@/components/screens/desktop/components/window-manager";
import { cn } from "@/lib/utils";

type AppGlyphProps = {
  app: AppMeta;
  className?: string;
  size?: number;
  variant?: "default" | "plain";
};

export function AppGlyph({
  app,
  className,
  size = 32,
  variant = "default",
}: AppGlyphProps) {
  if (typeof app.icon === "string" && app.icon.length > 0) {
    return (
      <Image
        src={`/assets/icons/apps/${app.icon}.ico`}
        alt={app.title}
        width={size}
        height={size}
        className={cn(
          "object-cover",
          variant === "plain" ? "rounded-[1.75rem]" : "rounded-[0.75rem]",
          className,
        )}
      />
    );
  }

  if (app.icon) {
    return (
      <span
        className={cn("text-[1.125rem] leading-none text-current", className)}
      >
        {app.icon}
      </span>
    );
  }

  const dimensionRem = `${size / 16}rem`;

  return (
    <div
      style={{ width: dimensionRem, height: dimensionRem }}
      className={cn(
        "flex items-center justify-center rounded-[0.75rem] bg-black/10",
        variant === "plain" && "bg-transparent",
        className,
      )}
    >
      <Square className="h-[1rem] w-[1rem] text-black/60" />
    </div>
  );
}
