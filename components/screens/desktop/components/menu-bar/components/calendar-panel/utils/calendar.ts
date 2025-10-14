export type CalendarCell = {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
};

export function buildCalendar(month: Date, today: Date): CalendarCell[] {
  const firstOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(firstOfMonth);
  const dayOffset = (firstOfMonth.getDay() + 6) % 7; // align weeks to start on Monday
  start.setDate(firstOfMonth.getDate() - dayOffset);

  const cells: CalendarCell[] = [];

  for (let index = 0; index < 42; index += 1) {
    const cellDate = new Date(start);
    cellDate.setDate(start.getDate() + index);

    cells.push({
      date: cellDate,
      isCurrentMonth: cellDate.getMonth() === month.getMonth(),
      isToday:
        cellDate.getFullYear() === today.getFullYear() &&
        cellDate.getMonth() === today.getMonth() &&
        cellDate.getDate() === today.getDate(),
    });
  }

  return cells;
}
