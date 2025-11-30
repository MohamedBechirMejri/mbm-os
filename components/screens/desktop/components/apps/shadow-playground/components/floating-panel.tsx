import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface FloatingPanelProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  contentClassName?: string;
}

export function FloatingPanel({
  children,
  title,
  className,
  contentClassName,
}: FloatingPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#1E1E1E]/80 backdrop-blur-xl shadow-2xl",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3 shrink-0">
        <span className="text-xs font-semibold uppercase tracking-wider text-white/60">
          {title}
        </span>
      </div>

      {/* Content */}
      <div
        className={cn(
          "flex-1 min-h-0 relative flex flex-col",
          contentClassName
        )}
      >
        {children}
      </div>
    </motion.div>
  );
}
