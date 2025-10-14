import { cn } from "@/lib/utils";

import { DAY_LABELS } from "../constants";
import type { CalendarCell } from "../utils/calendar";

type CalendarSectionProps = {
  monthLabel: string;
  cells: CalendarCell[];
};

export function CalendarSection({ monthLabel, cells }: CalendarSectionProps) {
  return (
    <section className="rounded-[28px] bg-white p-5 shadow-[0_12px_30px_rgba(28,28,30,0.12)]">
      <header className="text-left text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-[#FF3B30]">
        {monthLabel}
      </header>
      <div className="mt-4 grid grid-cols-7 gap-2">
        {DAY_LABELS.map((day) => (
          <span
            key={day.id}
            className="text-center text-[0.65rem] font-medium uppercase tracking-[0.25em] text-[#A1A1AA]"
          >
            {day.label}
          </span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-2">
        {cells.map((cell) => (
          <span
            key={cell.date.toISOString()}
            className={cn(
              "flex aspect-square w-full items-center justify-center rounded-full text-sm font-semibold transition-colors duration-200",
              cell.isToday
                ? "bg-[#FF3B30] text-white shadow-[0_6px_18px_rgba(255,59,48,0.35)]"
                : "text-[#1C1C1E] hover:bg-[#F2F2F7]",
              !cell.isCurrentMonth &&
                !cell.isToday &&
                "text-[#C7C7CC] hover:bg-transparent",
            )}
          >
            {cell.date.getDate()}
          </span>
        ))}
      </div>
    </section>
  );
}
