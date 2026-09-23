import {
  ExternalLink,
  GitBranch,
  GitCommit,
  GitPullRequest,
} from "lucide-react";
import { useEffect, useMemo, useRef } from "react";

export interface DayActivity {
  date: string;
  formattedDate: string;
  dayOfWeek: number;
  isInYear: boolean;
  isToday: boolean;
  isFuture: boolean;
  level: number;
  count: number;
}

export interface WeekActivity {
  weekIndex: number;
  days: DayActivity[];
  monthLabel?: string;
}

// Generate deterministic full calendar year activity data (53 weeks covering Jan 1 - Dec 31)
function generateFullYearGrid(targetYear = 2026) {
  const jan1 = new Date(targetYear, 0, 1);
  const dec31 = new Date(targetYear, 11, 31);

  // Align grid to Sunday of the first week
  const startDate = new Date(jan1);
  startDate.setDate(jan1.getDate() - jan1.getDay());

  // Align grid to Saturday of the last week
  const endDate = new Date(dec31);
  endDate.setDate(dec31.getDate() + (6 - dec31.getDay()));

  const now = new Date();
  const todayYear = now.getFullYear();
  const todayMonth = now.getMonth();
  const todayDate = now.getDate();
  const todayStr = [
    todayYear,
    String(todayMonth + 1).padStart(2, "0"),
    String(todayDate).padStart(2, "0"),
  ].join("-");

  const monthNames = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];

  const weeks: WeekActivity[] = [];
  const monthSeen = new Set<number>();
  const curr = new Date(startDate);
  let totalCommits = 0;
  let weekIdx = 0;

  while (curr <= endDate) {
    const days: DayActivity[] = [];
    let weekMonthLabel: string | undefined;

    for (let d = 0; d < 7; d++) {
      const year = curr.getFullYear();
      const month = curr.getMonth();
      const dateNum = curr.getDate();
      const dateStr = [
        year,
        String(month + 1).padStart(2, "0"),
        String(dateNum).padStart(2, "0"),
      ].join("-");

      const isInYear = year === targetYear;
      const isToday = dateStr === todayStr;

      // Local date comparison without UTC timezone distortion
      const currTime = new Date(year, month, dateNum).getTime();
      const todayTime = new Date(todayYear, todayMonth, todayDate).getTime();
      const isFuture = currTime > todayTime;

      // Month label for the first time a month appears in this week
      if (isInYear && !monthSeen.has(month) && !weekMonthLabel) {
        weekMonthLabel = monthNames[month];
        monthSeen.add(month);
      }

      let level = 0;
      let count = 0;

      if (isInYear && !isFuture) {
        // Deterministic pseudo-random seed based on day-of-year
        const dayOfYear = Math.floor(
          (currTime - new Date(targetYear, 0, 1).getTime()) / 86400000,
        );
        const hash = (dayOfYear * 17 + d * 31 + 47) % 100;

        if (isToday) {
          level = 4;
          count = 7;
        } else if (d === 0 || d === 6) {
          // Weekend: reduced frequency
          if (hash > 70) {
            level = (hash % 2) + 1;
            count = level * 2;
          }
        } else {
          // Weekdays: active engineering cadence
          if (hash > 84) {
            level = 4;
            count = 8 + (hash % 5);
          } else if (hash > 58) {
            level = 3;
            count = 4 + (hash % 3);
          } else if (hash > 30) {
            level = 2;
            count = 2 + (hash % 2);
          } else if (hash > 12) {
            level = 1;
            count = 1;
          } else {
            level = 0;
            count = 0;
          }
        }
        totalCommits += count;
      }

      const formattedDate = curr.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      days.push({
        date: dateStr,
        formattedDate,
        dayOfWeek: d,
        isInYear,
        isToday,
        isFuture,
        level,
        count,
      });

      curr.setDate(curr.getDate() + 1);
    }

    weeks.push({
      weekIndex: weekIdx,
      days,
      monthLabel: weekMonthLabel,
    });
    weekIdx++;
  }

  return { weeks, totalCommits };
}

export function GitHubActivityBar() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLDivElement>(null);

  // Memoize year activity data
  const { weeks } = useMemo(() => generateFullYearGrid(2026), []);

  // Smoothly center today's square within the horizontal scroll container on mount
  useEffect(() => {
    if (todayRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const todayEl = todayRef.current;
      const containerWidth = container.clientWidth;
      const todayLeft = todayEl.offsetLeft;
      const targetScroll = Math.max(0, todayLeft - containerWidth / 2 + 16);
      container.scrollTo({ left: targetScroll, behavior: "smooth" });
    }
  }, []);

  // Cell level styling using theme accent spectrum
  const getLevelClass = (level: number) => {
    switch (level) {
      case 1:
        return "bg-[rgba(224,160,0,0.25)] dark:bg-[rgba(255,185,48,0.25)]";
      case 2:
        return "bg-[rgba(224,160,0,0.55)] dark:bg-[rgba(255,185,48,0.55)]";
      case 3:
        return "bg-[#D49400] dark:bg-[#E5A320]";
      case 4:
        return "bg-[var(--accent)] shadow-[0_0_6px_rgba(224,160,0,0.4)] dark:shadow-[0_0_6px_rgba(255,185,48,0.5)]";
      default:
        return "bg-black/[0.07] dark:bg-white/[0.04]";
    }
  };

  return (
    <section
      id="github-activity"
      className="scroll-mt-24 space-y-5"
      aria-label="GitHub Activity Record"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[var(--ink-primary)]">
            Engineering &amp; Code Ledger
          </h3>
          <p className="font-serif italic text-xs sm:text-sm text-[var(--ink-secondary)] mt-0.5">
            Public contribution cadence, open-source repositories, and code
            history.
          </p>
        </div>

        <a
          href="https://github.com/zeetec20"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-[var(--accent)] hover:opacity-85 transition-opacity self-start sm:self-auto"
        >
          <span>@ZEETEC20 ON GITHUB</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Metrics Counters */}
      <div className="grid grid-cols-3 gap-3 py-1 font-mono text-[10px] uppercase tracking-wider">
        <div className="space-y-1 p-3 rounded-xs backdrop-blur-md bg-white/25 dark:bg-white/[0.04] border border-black/[0.07] dark:border-white/[0.1]">
          <div className="text-[var(--ink-muted)] text-[9px] flex items-center gap-1">
            <GitCommit className="w-3 h-3 text-[var(--accent)]" />
            <span>ANNUAL COMMITS</span>
          </div>
          <div className="font-serif text-lg font-bold text-[var(--ink-primary)]">
            1,428
          </div>
        </div>

        <div className="space-y-1 p-3 rounded-xs backdrop-blur-md bg-white/25 dark:bg-white/[0.04] border border-black/[0.07] dark:border-white/[0.1]">
          <div className="text-[var(--ink-muted)] text-[9px] flex items-center gap-1">
            <GitBranch className="w-3 h-3 text-[var(--accent)]" />
            <span>ACTIVE REPOSITORIES</span>
          </div>
          <div className="font-serif text-lg font-bold text-[var(--ink-primary)]">
            16
          </div>
        </div>

        <div className="space-y-1 p-3 rounded-xs backdrop-blur-md bg-white/25 dark:bg-white/[0.04] border border-black/[0.07] dark:border-white/[0.1]">
          <div className="text-[var(--ink-muted)] text-[9px] flex items-center gap-1">
            <GitPullRequest className="w-3 h-3 text-[var(--accent)]" />
            <span>CURRENT CADENCE</span>
          </div>
          <div className="font-serif text-lg font-bold text-[var(--accent)]">
            38-DAY STREAK
          </div>
        </div>
      </div>

      {/* Contribution Calendar Heatmap */}
      <div className="p-4 sm:p-5 rounded-xs backdrop-blur-md bg-white/25 dark:bg-white/[0.04] border border-black/[0.07] dark:border-white/[0.1] space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-y-2 font-mono text-[9px] text-[var(--ink-muted)] uppercase tracking-widest">
          <span>CONTRIBUTION DENSITY // MMXXVI (53 WEEKS · JAN—DEC)</span>
          <div className="flex items-center gap-3">
            {/* Standard Heatmap Scale */}
            <div className="flex items-center gap-1.5">
              <span>LESS</span>
              <div className="flex items-center gap-1">
                <span
                  title="0 contributions"
                  className="w-2.5 h-2.5 rounded-[1px] bg-black/[0.07] dark:bg-white/[0.04]"
                />
                <span
                  title="1 contribution"
                  className="w-2.5 h-2.5 rounded-[1px] bg-[rgba(224,160,0,0.25)] dark:bg-[rgba(255,185,48,0.25)]"
                />
                <span
                  title="2-3 contributions"
                  className="w-2.5 h-2.5 rounded-[1px] bg-[rgba(224,160,0,0.55)] dark:bg-[rgba(255,185,48,0.55)]"
                />
                <span
                  title="4-5 contributions"
                  className="w-2.5 h-2.5 rounded-[1px] bg-[#D49400] dark:bg-[#E5A320]"
                />
                <span
                  title="6+ contributions"
                  className="w-2.5 h-2.5 rounded-[1px] bg-[var(--accent)] shadow-[0_0_4px_var(--accent)]"
                />
              </div>
              <span>MORE</span>
            </div>

            {/* Today Legend Marker */}
            <div className="flex items-center gap-1.5 pl-2.5 border-l border-black/10 dark:border-white/10">
              <span className="relative flex items-center justify-center w-2.5 h-2.5 rounded-[1px] bg-[var(--accent)] ring-1 ring-[var(--accent)] ring-offset-1 ring-offset-[#F5F1E9] dark:ring-offset-[#0A0908]" />
              <span className="text-[var(--accent)] font-semibold">TODAY</span>
            </div>
          </div>
        </div>

        {/* Heatmap with Month labels on top and Weekday labels on left */}
        <div className="flex items-start gap-2 pt-1">
          {/* Weekday indicators (Mon, Wed, Fri) aligned with row heights */}
          <div className="flex flex-col gap-1 text-[8px] sm:text-[9px] font-mono text-[var(--ink-muted)] select-none shrink-0 text-right pr-1">
            <div className="h-4 mb-1" aria-hidden="true" />
            <div className="h-2.5 sm:h-3 flex items-center justify-end leading-none" />
            <div className="h-2.5 sm:h-3 flex items-center justify-end leading-none">
              MON
            </div>
            <div className="h-2.5 sm:h-3 flex items-center justify-end leading-none" />
            <div className="h-2.5 sm:h-3 flex items-center justify-end leading-none">
              WED
            </div>
            <div className="h-2.5 sm:h-3 flex items-center justify-end leading-none" />
            <div className="h-2.5 sm:h-3 flex items-center justify-end leading-none">
              FRI
            </div>
            <div className="h-2.5 sm:h-3 flex items-center justify-end leading-none" />
          </div>

          {/* Scrollable / Responsive Grid */}
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto pb-1 flex-1 scroll-smooth"
          >
            <div className="inline-flex flex-col min-w-max">
              {/* Month Markers Row */}
              <div className="h-4 flex items-end gap-1 mb-1 font-mono text-[8px] sm:text-[9px] text-[var(--ink-muted)] select-none">
                {weeks.map((w, wIdx) => (
                  <div
                    key={wIdx}
                    className="w-2.5 sm:w-3 h-full relative shrink-0"
                  >
                    {w.monthLabel && (
                      <span className="absolute left-0 bottom-0 whitespace-nowrap font-medium text-[var(--ink-secondary)]">
                        {w.monthLabel}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Day Cells Columns */}
              <div className="inline-flex gap-1">
                {weeks.map((week, wIdx) => (
                  <div key={wIdx} className="flex flex-col gap-1 shrink-0">
                    {week.days.map((day, dIdx) => {
                      if (!day.isInYear) {
                        return (
                          <div
                            key={dIdx}
                            className="w-2.5 h-2.5 sm:w-3 sm:h-3 invisible pointer-events-none"
                            aria-hidden="true"
                          />
                        );
                      }

                      if (day.isToday) {
                        return (
                          <div
                            key={dIdx}
                            ref={todayRef}
                            title={`Today (${day.formattedDate}) — ${day.count} contributions (Active Cadence)`}
                            className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[1px] bg-[var(--accent)] ring-2 ring-[var(--accent)] ring-offset-1 ring-offset-[#F5F1E9] dark:ring-offset-[#0A0908] z-10 scale-125 shadow-[0_0_8px_var(--accent)] animate-pulse relative transition-transform"
                          >
                            <span className="absolute -top-0.5 -right-0.5 w-1 h-1 rounded-full bg-[var(--accent)] shadow-xs animate-ping" />
                          </div>
                        );
                      }

                      if (day.isFuture) {
                        return (
                          <div
                            key={dIdx}
                            title={`Upcoming (${day.formattedDate})`}
                            className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[1px] border border-dashed border-black/15 dark:border-white/15 bg-black/[0.02] dark:bg-white/[0.02] opacity-45 hover:opacity-85 transition-opacity"
                          />
                        );
                      }

                      return (
                        <div
                          key={dIdx}
                          title={`${day.formattedDate}: ${day.count} contribution${day.count === 1 ? "" : "s"}`}
                          className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[1px] transition-colors ${getLevelClass(
                            day.level,
                          )}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
