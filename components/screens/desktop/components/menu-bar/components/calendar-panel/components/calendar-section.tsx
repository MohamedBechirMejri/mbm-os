import { cn } from "@/lib/utils";

import { DAY_LABELS } from "../constants";
import type { CalendarCell } from "../utils/calendar";

type CalendarSectionProps = {
  monthLabel: string;
  cells: CalendarCell[];
};

export function CalendarSection({ monthLabel, cells }: CalendarSectionProps) {
  return (
    <section className="rounded-3xl p-4 bg-[#F4F4F4]">
      <header className="flex items-center justify-between text-xs uppercase tracking-[0.2rem]">
        <span>Calendar</span>
        <span>{monthLabel}</span>
      </header>
      <div className="mt-4 grid grid-cols-7 gap-2">
        {DAY_LABELS.map((day) => (
          <span key={day.id} className="text-center text-xs font-semibold">
            {day.label}
          </span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-2">
        {cells.map((cell) => (
          <span
            key={cell.date.toISOString()}
            className={cn(
              "flex aspect-square w-full items-center justify-center rounded-2xl text-sm transition",
              cell.isToday ? "" : "",
              !cell.isCurrentMonth && "",
            )}
          >
            {cell.date.getDate()}
          </span>
        ))}
      </div>
    </section>
  );
}
