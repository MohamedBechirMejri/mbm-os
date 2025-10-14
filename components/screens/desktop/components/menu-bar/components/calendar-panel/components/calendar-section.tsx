import { useMemo } from "react";
import Counter from "@/components/ui/counter";
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
  onAdjustMonth: (delta: number) => void;
};

export function CalendarSection({
  monthLabel,
  cells,
  onAdjustMonth,
}: CalendarSectionProps) {
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
    <section className="rounded-4xl bg-white p-5 shadow-xl">
      <header className="text-left text-[0.65rem] font-bold uppercase  tracking-widest text-[#FF3B30] pl-1.5 flex justify-between">
        <div className="flex items-center">
          <h1>{monthLabel.split(" ")[0]}</h1>
          <Counter
            value={+monthLabel.split(" ")[1]}
            places={[1000, 100, 10, 1]}
            textColor="#FF3B30"
            fontSize={12}
            gap={0}
          />
        </div>
        <div className="flex items-center">
          <button
            type="button"
            className="h-6 w-6 rounded-full hover:bg-black/10 flex items-center justify-center"
            onClick={() => onAdjustMonth(-1)}
            aria-label="Previous Month"
          >
            <span className="text-xl font-light leading-none text-black">
              ‹
            </span>
          </button>
          <button
            type="button"
            className="ml-2 h-6 w-6 rounded-full hover:bg-black/10 flex items-center justify-center"
            onClick={() => onAdjustMonth(1)}
            aria-label="Next Month"
          >
            <span className="text-xl font-light leading-none text-black"></span>
            <span className="text-xl font-light leading-none text-black">
              ›
            </span>
          </button>
        </div>
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
