"use client";

import type { PointerEvent } from "react";
import useCurrentTime from "../hooks/use-current-time";

type ClockProps = {
  isActive: boolean;
  onToggle: () => void;
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function formatDate(date: Date) {
  const dayName = DAY_NAMES[date.getDay()];
  const monthName = MONTH_NAMES[date.getMonth()];
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;

  return `${dayName} ${monthName} ${day}  ${displayHours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")} ${ampm}`;
}

export function Clock({ isActive, onToggle }: ClockProps) {
  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onToggle();
  };

  const date = useCurrentTime();

  return (
    <button
      type="button"
      className={`grid grid-cols-[auto_auto_auto_minmax(0,1fr)_auto] items-center gap-1 text-sm font-medium rounded transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 text-white/90 active:bg-white/10 w-37`}
      onPointerDown={handlePointerDown}
      aria-pressed={isActive}
      aria-haspopup="dialog"
      aria-expanded={isActive}
    >
      {formatDate(date)
        .replace("  ", " ")
        .split(" ")
        .map((x, i) => (
          <div key={`date-${i}-${x}`} className="w-max">
            {x}
          </div>
        ))}
    </button>
  );
}
