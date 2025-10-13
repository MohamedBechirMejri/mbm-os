import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

const DOT_COUNT = 60;

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
    <div className="relative h-full w-full">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10"
        style={
          {
            "--ring-radius": "calc(50% - 14px)",
          } as CSSProperties
        }
      >
        {Array.from({ length: DOT_COUNT }, (_, index) => {
          const angle = (index / DOT_COUNT) * 360;
          const isActive = index <= seconds;

          return (
            <span
              key={`dot -${angle}${Math.random()}`}
              className="absolute left-1/2 top-1/2"
              style={{ transform: `rotate(${angle}deg)` }}
            >
              <span
                className={cn(
                  "block h-2 w-[3px] rounded-full transition-colors duration-300 ease-out",
                  isActive
                    ? "bg-zinc-900 shadow-[0_0_6px_rgba(0,0,0,0.35)]"
                    : "bg-zinc-300/70",
                )}
                style={{
                  transform: "translate(-50%, calc(var(--ring-radius) * -1))",
                }}
              />
            </span>
          );
        })}
      </div>

      <div className="relative z-20 flex h-full w-full flex-col items-end gap-3 rounded-4xl bg-[#F4F4F4] p-4 shadow-xl">
        <p className="flex flex-col items-end">
          <span className="text-2xl font-semibold">{formattedTime}</span>
          <span className="text-xs">{timeZone}</span>
        </p>
      </div>
    </div>
  );
}
