"use client";

import type { PointerEvent } from "react";

type ClockProps = {
  date: Date;
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
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;

  return `${dayName} ${monthName} ${day}  ${displayHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
}

export function Clock({ date, isActive, onToggle }: ClockProps) {
  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onToggle();
  };

  return (
    <button
      type="button"
      className={`flex items-center gap-1 px-2 text-sm font-medium rounded transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${
        isActive ? "bg-white/20 text-white" : "text-white/90 hover:bg-white/10"
      }`}
      onPointerDown={handlePointerDown}
      aria-pressed={isActive}
      aria-haspopup="dialog"
      aria-expanded={isActive}
    >
      {formatDate(date)}
    </button>
  );
}
