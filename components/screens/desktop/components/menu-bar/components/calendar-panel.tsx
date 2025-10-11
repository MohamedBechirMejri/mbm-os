"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";

type CalendarPanelProps = {
  referenceDate: Date;
};

type CalendarCell = {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
};

type QuickEvent = {
  id: string;
  timeLabel: string;
  description: string;
};

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"] as const;

const QUICK_EVENTS: QuickEvent[] = [
  {
    id: "standup",
    timeLabel: "09:30",
    description: "Design stand-up",
  },
  {
    id: "sync",
    timeLabel: "11:00",
    description: "Product sync",
  },
  {
    id: "coffee",
    timeLabel: "14:00",
    description: "Coffee with Lea",
  },
];

function buildCalendar(date: Date, referenceDate: Date): CalendarCell[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

  return Array.from({ length: totalCells }, (_, index) => {
    const dayNumber = index - startOffset + 1;
    const cellDate = new Date(year, month, dayNumber);
    const isCurrentMonth = cellDate.getMonth() === month;
    const isToday =
      cellDate.getFullYear() === referenceDate.getFullYear() &&
      cellDate.getMonth() === referenceDate.getMonth() &&
      cellDate.getDate() === referenceDate.getDate();

    return {
      date: cellDate,
      isCurrentMonth,
      isToday,
    };
  });
}

function getMonthLabel(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function CalendarPanel({ referenceDate }: CalendarPanelProps) {
  const [monthOffset, setMonthOffset] = useState(0);

  const visibleMonth = useMemo(() => {
    const base = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth(),
      1,
    );

    base.setMonth(base.getMonth() + monthOffset);
    return base;
  }, [referenceDate, monthOffset]);

  const cells = useMemo(
    () => buildCalendar(visibleMonth, referenceDate),
    [visibleMonth, referenceDate],
  );

  return (
    <section className="w-72 rounded-3xl border border-white/12 bg-gradient-to-br from-white/25 via-white/10 to-white/5 text-white shadow-[0_1rem_2.25rem_rgba(0,0,0,0.35)] backdrop-blur-2xl">
      <header className="flex items-center justify-between px-4 pt-4 pb-3">
        <div>
          <p className="text-sm font-semibold leading-tight">
            {getMonthLabel(visibleMonth)}
          </p>
          <p className="text-xs text-white/60">
            {referenceDate.toDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20"
            onClick={() => setMonthOffset((offset) => offset - 1)}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20"
            onClick={() => setMonthOffset((offset) => offset + 1)}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          {monthOffset !== 0 ? (
            <button
              type="button"
              className="h-8 rounded-full bg-white/15 px-3 text-xs font-medium text-white transition-colors hover:bg-white/25"
              onClick={() => setMonthOffset(0)}
            >
              Today
            </button>
          ) : null}
        </div>
      </header>

      <div className="px-4 pb-4">
        <div className="grid grid-cols-7 gap-y-2 text-center text-[0.75rem] text-white/60">
          {DAY_LABELS.map((label) => (
            <span key={label} className="font-medium uppercase tracking-wide">
              {label}
            </span>
          ))}
        </div>

        <div className="mt-2 grid grid-cols-7 gap-y-2 text-center text-sm">
          {cells.map((cell) => {
            const dayNumber = cell.date.getDate();
            const cellKey = `${cell.date.getFullYear()}-${cell.date.getMonth()}-${cell.date.getDate()}`;

            return (
              <span
                key={cellKey}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors",
                  cell.isToday &&
                    "bg-white text-black shadow-[0_0.5rem_1.5rem_rgba(255,255,255,0.45)]",
                  !cell.isToday && cell.isCurrentMonth
                    ? "text-white/90 hover:bg-white/15"
                    : "text-white/30",
                )}
              >
                {dayNumber}
              </span>
            );
          })}
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/10 p-3">
          <p className="text-xs font-semibold text-white/80">Up next</p>
          <ul className="mt-2 space-y-2">
            {QUICK_EVENTS.map((event) => (
              <li
                key={event.id}
                className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2"
              >
                <span className="text-xs font-medium text-white/70">
                  {event.description}
                </span>
                <span className="text-[0.75rem] text-white/60">
                  {event.timeLabel}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
