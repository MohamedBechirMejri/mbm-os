import { cn } from "@/lib/utils";

const DOT_COUNT = 60;
const VIEWBOX_SIZE = 100;
const EDGE_INSET = 8;
const DOT_RADIUS = 0.9;

const INNER_WIDTH = VIEWBOX_SIZE - EDGE_INSET * 2;
const INNER_HEIGHT = VIEWBOX_SIZE - EDGE_INSET * 2;
const PERIMETER = 2 * (INNER_WIDTH + INNER_HEIGHT);
const START_OFFSET = INNER_WIDTH / 2;

const DOT_POSITIONS = Array.from({ length: DOT_COUNT }, (_, index) => {
  const rawDistance = (PERIMETER * index) / DOT_COUNT;
  const distance = (rawDistance + START_OFFSET) % PERIMETER;

  if (distance < INNER_WIDTH) {
    return {
      key: `tick-top-${index}`,
      cx: EDGE_INSET + distance,
      cy: EDGE_INSET,
      sequence: index,
    } as const;
  }

  if (distance < INNER_WIDTH + INNER_HEIGHT) {
    const offset = distance - INNER_WIDTH;
    return {
      key: `tick-right-${index}`,
      cx: EDGE_INSET + INNER_WIDTH,
      cy: EDGE_INSET + offset,
      sequence: index,
    } as const;
  }

  if (distance < INNER_WIDTH * 2 + INNER_HEIGHT) {
    const offset = distance - (INNER_WIDTH + INNER_HEIGHT);
    return {
      key: `tick-bottom-${index}`,
      cx: EDGE_INSET + INNER_WIDTH - offset,
      cy: EDGE_INSET + INNER_HEIGHT,
      sequence: index,
    } as const;
  }

  const offset = distance - (INNER_WIDTH * 2 + INNER_HEIGHT);
  return {
    key: `tick-left-${index}`,
    cx: EDGE_INSET,
    cy: EDGE_INSET + INNER_HEIGHT - offset,
    sequence: index,
  } as const;
});

export default function ClockWidget({
  formattedTime,
  timeZone,
  seconds,
}: {
  formattedTime: string;
  timeZone: string;
  seconds: number;
}) {
  return (
    <div className="relative z-20 flex h-full w-full flex-col items-end gap-3 rounded-4xl bg-[#F4F4F4] p-4 shadow-xl">
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {DOT_POSITIONS.map((dot) => {
          const isActive = dot.sequence <= seconds;

          return (
            <circle
              key={dot.key}
              cx={dot.cx}
              cy={dot.cy}
              r={DOT_RADIUS}
              className={cn(
                "transition-all duration-200 ease-out",
                isActive
                  ? "fill-zinc-900 drop-shadow-[0_0_6px_rgba(0,0,0,0.35)]"
                  : "fill-zinc-300/70 drop-shadow-[0_0_2px_rgba(0,0,0,0.15)]",
              )}
            />
          );
        })}
      </svg>
      <p className="flex flex-col items-end">
        <span className="text-2xl font-semibold">{formattedTime}</span>
        <span className="text-xs">{timeZone}</span>
      </p>
    </div>
  );
}
