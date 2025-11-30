import { useRef, useEffect } from "react";
import { motion, useMotionValue } from "motion/react";
import { Button } from "@/components/ui/button";

interface PreviewCanvasProps {
  cssValue: string;
}

export function PreviewCanvas({
  cssValue,
  backgroundColor = "#121212",
}: PreviewCanvasProps & { backgroundColor?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const newScale = scale.get() - e.deltaY * 0.01;
        scale.set(Math.min(Math.max(0.1, newScale), 5));
      } else {
        x.set(x.get() - e.deltaX);
        y.set(y.get() - e.deltaY);
      }
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, [x, y, scale]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden cursor-grab active:cursor-grabbing transition-colors duration-300"
      style={{ backgroundColor }}
    >
      {/* Dot Pattern Background */}
      <div
        className="absolute inset-0 opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <motion.div
        drag
        dragConstraints={{ left: -1000, right: 1000, top: -1000, bottom: 1000 }}
        style={{ x, y, scale }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div
          className="h-48 w-48 rounded-2xl bg-white will-change-[box-shadow]"
          style={{ boxShadow: cssValue }}
        />
      </motion.div>

      <div className="absolute bottom-4 right-4 flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="bg-black/50 hover:bg-black/70 text-white backdrop-blur-md"
          onClick={() => {
            x.set(0);
            y.set(0);
            scale.set(1);
          }}
        >
          Reset View
        </Button>
      </div>
    </div>
  );
}
