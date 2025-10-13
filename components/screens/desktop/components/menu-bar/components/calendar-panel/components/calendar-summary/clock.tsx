import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const TICK_COUNT = 60;

function generateTicks({ width, height }: { width: number; height: number }) {
  const ticks = [];
  const perimeter = (width + height) * 2;
  const centerX = width / 2;
  const centerY = height / 2;

  // Start from top center (offset by half of top edge)
  const startOffset = width / 2;

  for (let i = 0; i < TICK_COUNT; i++) {
    const distance = ((i / TICK_COUNT) * perimeter + startOffset) % perimeter;
    const progress = i / TICK_COUNT;

    let x: number, y: number;

    if (distance < width) {
      // Top edge: left to right
      x = distance;
      y = 0;
    } else if (distance < width + height) {
      // Right edge: top to bottom
      x = width;
      y = distance - width;
    } else if (distance < width * 2 + height) {
      // Bottom edge: right to left
      x = width - (distance - width - height);
      y = height;
    } else {
      // Left edge: bottom to top
      x = 0;
      y = height - (distance - width * 2 - height);
    }

    // Calculate angle from tick to center (pointing inward)
    const angleToCenter =
      Math.atan2(centerY - y, centerX - x) * (180 / Math.PI);
    const rotation = angleToCenter + 90; // +90 because the tick's default orientation is vertical

    ticks.push({ x, y, rotation, progress });
  }

  return ticks;
}

export default function ClockWidget({
  formattedTime,
  timeZone,
  seconds,
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
    <div className="relative z-20 flex h-full w-full items-center justify-center rounded-4xl bg-[#F4F4F4] p-4 shadow-xl">
      <div
        ref={containerRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-3 z-20 rounded-[2.5rem]"
      >
        {ticks.map((tick, index) => {
          // Calculate smooth opacity based on distance from current second
          const distanceFromCurrent = Math.abs(index - seconds);
          const wrapDistance = Math.min(
            distanceFromCurrent,
            TICK_COUNT - distanceFromCurrent,
          );

          // Smooth gradient: fully dark at current, gradually lighter within 3 ticks
          const gradientRange = 3;
          let opacity: number;

          if (wrapDistance === 0) {
            opacity = 1; // Current second - fully dark
          } else if (wrapDistance <= gradientRange) {
            // Gradient zone - smooth transition
            opacity = 0.5 + (1 - wrapDistance / gradientRange) * 0.5;
          } else if (index < seconds) {
            opacity = 0.5; // Past seconds
          } else {
            opacity = 0.2; // Future seconds
          }

          return (
            <span
              key={`${tick.progress}${tick.x}${tick.y}`}
              className={cn(
                "absolute origin-center transition-opacity duration-1000 ease-out",
                index % 5 === 0
                  ? "h-4 w-[0.1875rem] rounded-full"
                  : "h-2 w-[0.125rem] rounded-full",
              )}
              style={{
                left: `${tick.x}px`,
                top: `${tick.y}px`,
                transform: `translate(-50%, -50%) rotate(${tick.rotation}deg)`,
                backgroundColor: `rgba(0, 0, 0, ${opacity})`,
              }}
            />
          );
        })}
      </div>
      <p className="flex flex-col items-center">
        <span className="text-5xl font-semibold tracking-tight">
          {formattedTime}
        </span>
        <span className="text-sm text-black/60">{timeZone}</span>
      </p>
    </div>
  );
}
