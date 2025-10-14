export type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const WEEKDAY_SYMBOLS: Record<WeekdayIndex, string> = {
  0: "S",
  1: "M",
  2: "T",
  3: "W",
  4: "T",
  5: "F",
  6: "S",
};

export const WEEKEND_DAY_INDICES: WeekdayIndex[] = [6, 0];
