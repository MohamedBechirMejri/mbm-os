"use client";

import { ActiveSessionSection } from "./components/active-session-section";
import { CalendarSection } from "./components/calendar-section";
import { CalendarSummary } from "./components/calendar-summary";
import { GlassTile } from "./components/glass-tile";
import { TodayFlowSection } from "./components/today-flow-section";
import { useCalendarPanel } from "./hooks/use-calendar-panel";

type CalendarPanelProps = {
  referenceDate: Date;
};

export function CalendarPanel({ referenceDate }: CalendarPanelProps) {
  const { summary, calendar, session, flow, handlers } =
    useCalendarPanel(referenceDate);

  return (
    <GlassTile className="w-[30rem]">
      <CalendarSummary
        dayLabel={summary.dayLabel}
        dayNumber={summary.dayNumber}
        monthLabel={summary.monthLabel}
        formattedTime={summary.formattedTime}
        timeZone={summary.timeZone}
        openWindowCount={summary.openWindowCount}
        onAdjustMonth={handlers.adjustMonth}
      />

      <div className="mt-6 grid gap-5">
        <CalendarSection
          monthLabel={calendar.monthLabel}
          cells={calendar.cells}
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
