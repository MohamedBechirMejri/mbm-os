import { useMemo } from "react";

import { cn } from "@/lib/utils";

import {
  WEEKDAY_SYMBOLS,
  WEEKEND_DAY_INDICES,
  type WeekdayIndex,
} from "../constants";
import type { CalendarCell } from "../utils/calendar";

type CalendarSectionProps = {
  monthLabel: string;
  cells: CalendarCell[];
};

export function CalendarSection({ monthLabel, cells }: CalendarSectionProps) {
  const weekendDays = useMemo(
    () => new Set<WeekdayIndex>(WEEKEND_DAY_INDICES),
    [],
  );

  const headerDays = useMemo(() => {
    return cells.slice(0, 7).map((cell) => {
      const dayIndex = (cell.date.getDay() % 7) as WeekdayIndex;
      return {
        key: dayIndex,
        label: WEEKDAY_SYMBOLS[dayIndex],
        isWeekend: weekendDays.has(dayIndex),
      };
    });
  }, [cells, weekendDays]);

  return (
    <section className="rounded-[28px] bg-white p-5 shadow-[0_12px_30px_rgba(28,28,30,0.12)]">
      <header className="text-left text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-[#FF3B30]">
        {monthLabel}
      </header>
      <div className="mt-4 grid grid-cols-7 gap-2">
        {headerDays.map((day) => (
          <span
            key={day.key}
            className={cn(
              "text-center text-sm font-semibold uppercase tracking-[0.25em] text-black",
              day.isWeekend && "text-black/40",
            )}
          >
            {day.label}
          </span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-2">
        {cells.map((cell) => {
          const dayIndex = (cell.date.getDay() % 7) as WeekdayIndex;
          const isWeekend = weekendDays.has(dayIndex);
          return (
            <span
              key={cell.date.toISOString()}
              className={cn(
                "flex aspect-square w-full items-center justify-center rounded-full text-sm font-semibold transition-colors duration-200",
                cell.isToday
                  ? "bg-[#FF3B30] text-white"
                  : isWeekend
                    ? "text-[#FF3B30] hover:bg-[#FFECEF]"
                    : "text-[#1C1C1E] hover:bg-[#F2F2F7]",
                !cell.isCurrentMonth &&
                  !cell.isToday &&
                  "text-[#C7C7CC] hover:bg-transparent",
              )}
            >
              {cell.date.getDate()}
            </span>
          );
        })}
      </div>
    </section>
  );
}
