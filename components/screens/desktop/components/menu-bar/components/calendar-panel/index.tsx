"use client";

import useCurrentTime from "../../hooks/use-current-time";
import { CalendarSection } from "./components/calendar-section";
import { CalendarSummary } from "./components/calendar-summary";
import { GlassTile } from "./components/glass-tile";
import { useCalendarPanel } from "./hooks/use-calendar-panel";

export function CalendarPanel() {
  const referenceDate = useCurrentTime();
  const { summary, calendar, handlers } = useCalendarPanel(referenceDate);

  return (
    <GlassTile className="w-[22rem]">
      <CalendarSummary
        dayLabel={summary.dayLabel}
        dayNumber={summary.dayNumber}
        monthLabel={summary.monthLabel}
        referenceDate={summary.referenceDate}
        timeZone={summary.timeZone}
        seconds={summary.seconds}
        openWindowCount={summary.openWindowCount}
        onAdjustMonth={handlers.adjustMonth}
      />

      <div className="mt-6 grid gap-5">
        <CalendarSection
          monthLabel={calendar.monthLabel}
          cells={calendar.cells}
          onAdjustMonth={handlers.adjustMonth}
        />
        {/* <ActiveSessionSection
          activeWindow={session.activeWindow}
          activeMeta={session.activeMeta}
          activeStateLabel={session.activeStateLabel}
          sessionStats={session.sessionStats}
          uniqueAppsCount={session.uniqueAppsCount}
          onFocusWindow={handlers.focusWindow}
        />
        <TodayFlowSection
          totalCount={flow.totalCount}
          entries={flow.entries}
          onFocusWindow={handlers.focusWindow}
        /> */}
      </div>
    </GlassTile>
  );
}
