import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const TICK_COUNT = 60;

function generateTicks({ width, height }: { width: number; height: number }) {
  const ticks = [];
  const perimeter = (width + height) * 2;

  for (let i = 0; i < TICK_COUNT; i++) {
    const distance = (i / TICK_COUNT) * perimeter;
    const progress = i / TICK_COUNT;

    let x: number, y: number, rotation: number;

    if (distance < width) {
      // Top edge: left to right
      x = distance;
      y = 0;
      rotation = 0;
    } else if (distance < width + height) {
      // Right edge: top to bottom
      x = width;
      y = distance - width;
      rotation = 90;
    } else if (distance < width * 2 + height) {
      // Bottom edge: right to left
      x = width - (distance - width - height);
      y = height;
      rotation = 180;
    } else {
      // Left edge: bottom to top
      x = 0;
      y = height - (distance - width * 2 - height);
      rotation = 270;
    }

    ticks.push({ x, y, rotation, progress });
  }

  return ticks;
}

export default function ClockWidget({
  formattedTime,
  timeZone,
}: {
  formattedTime: string;
  timeZone: string;
  seconds: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();

    const observer = new ResizeObserver(updateDimensions);
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  const ticks =
    dimensions.width > 0
      ? generateTicks({ width: dimensions.width, height: dimensions.height })
      : [];

  return (
    <div className="relative z-20 flex h-full w-full flex-col items-end gap-3 rounded-4xl bg-[#F4F4F4] p-4 shadow-xl">
      <div
        ref={containerRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-3 z-20 rounded-[2.5rem]"
      >
        {ticks.map((tick, index) => (
          <span
            key={`${tick.progress}${tick.x}${tick.y}`}
            className={cn(
              "absolute origin-center bg-black/20",
              index % 5 === 0 ? "h-3 w-1.5 rounded" : "h-2 w-1 rounded-sm",
            )}
            style={{
              left: `${tick.x}px`,
              top: `${tick.y}px`,
              transform: `translate(-50%, -50%) rotate(${tick.rotation}deg)`,
            }}
          />
        ))}
      </div>
      <p className="flex flex-col items-end">
        <span className="text-2xl font-semibold">{formattedTime}</span>
        <span className="text-xs">{timeZone}</span>
      </p>
    </div>
  );
}
