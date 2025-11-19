import { useState, useRef } from "react";
import { motion, useMotionValue, useTransform } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ComparisonSliderProps {
  beforeUrl: string;
  afterUrl: string;
  mode?: "overlay" | "sideBySide";
}

export function ComparisonSlider({
  beforeUrl,
  afterUrl,
  mode = "overlay",
}: ComparisonSliderProps) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    updatePosition(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging.current) {
      updatePosition(e.clientX);
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const updatePosition = (clientX: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(percentage);
  };

  // Set up global mouse listeners
  useState(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  });

  if (mode === "sideBySide") {
    return (
      <div className="flex gap-4 w-full h-full">
        <div className="flex-1 relative rounded-lg overflow-hidden">
          <img src={beforeUrl} alt="Before" className="w-full h-full object-contain" />
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded backdrop-blur-sm">
            Before
          </div>
        </div>
        <div className="flex-1 relative rounded-lg overflow-hidden">
          <img src={afterUrl} alt="After" className="w-full h-full object-contain" />
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded backdrop-blur-sm">
            After
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden rounded-lg cursor-col-resize select-none"
    >
      {/* Before image (background) */}
      <div className="absolute inset-0">
        <img src={beforeUrl} alt="Before" className="w-full h-full object-contain" />
      </div>

      {/* After image (clipped) */}
      <motion.div
        className="absolute inset-0 overflow-hidden"
        style={{
          clipPath: `inset(0 ${100 - position}% 0 0)`,
        }}
      >
        <img src={afterUrl} alt="After" className="w-full h-full object-contain" />
      </motion.div>

      {/* Slider handle */}
      <motion.div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
        style={{
          left: `${position}%`,
          transform: "translateX(-50%)",
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Handle grip */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center cursor-col-resize">
          <ChevronLeft className="h-4 w-4 text-gray-700 -mr-1" />
          <ChevronRight className="h-4 w-4 text-gray-700 -ml-1" />
        </div>
      </motion.div>

      {/* Labels */}
      <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded backdrop-blur-sm pointer-events-none">
        Before
      </div>
      <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded backdrop-blur-sm pointer-events-none">
        After
      </div>
    </div>
  );
}
