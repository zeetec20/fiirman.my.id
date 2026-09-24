import { useCallback, useEffect, useState } from "react";

export interface ArticleSection {
  id: string;
  title: string;
}

interface ArticleScrollbarProps {
  sections: ArticleSection[];
}

export function ArticleScrollbar({ sections }: ArticleScrollbarProps) {
  const [scrollPercent, setScrollPercent] = useState<number>(0);
  const [activeSectionIndex, setActiveSectionIndex] = useState<number>(0);
  const [activeSubTickFraction, setActiveSubTickFraction] = useState<number>(0);

  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const scrollHeight = document.documentElement.scrollHeight;
    const docHeight = scrollHeight - windowHeight;
    const progress =
      docHeight > 0
        ? Math.min(100, Math.max(0, Math.round((scrollTop / docHeight) * 100)))
        : 0;

    setScrollPercent(progress);

    if (sections.length === 0) return;

    // Check if scrolled near the bottom of page (guarantee last title is marked)
    const isAtBottom =
      scrollTop + windowHeight >= scrollHeight - 60 || progress >= 98;

    if (isAtBottom) {
      setActiveSectionIndex(sections.length - 1);
      setActiveSubTickFraction(1);
      return;
    }

    // Find active section based on current scroll position
    const threshold = Math.min(200, windowHeight * 0.35); // adaptive threshold
    let activeIdx = 0;

    for (let i = 0; i < sections.length; i++) {
      const el = document.getElementById(sections[i].id);
      if (el) {
        const top = el.getBoundingClientRect().top;
        if (top <= threshold) {
          activeIdx = i;
        }
      }
    }

    // Compute fraction within active section towards next section (for mini ticks)
    let fraction = 0;
    const currentEl = document.getElementById(sections[activeIdx]?.id);
    const nextEl =
      activeIdx < sections.length - 1
        ? document.getElementById(sections[activeIdx + 1]?.id)
        : null;

    if (currentEl && nextEl) {
      const start = currentEl.getBoundingClientRect().top;
      const end = nextEl.getBoundingClientRect().top;
      const distance = end - start;
      if (distance > 0) {
        fraction = Math.max(0, Math.min(1, (threshold - start) / distance));
      }
    } else if (activeIdx === sections.length - 1) {
      fraction = progress >= 98 ? 1 : 0.5;
    }

    setActiveSectionIndex(activeIdx);
    setActiveSubTickFraction(fraction);
  }, [sections]);

  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      handleScroll();
    });
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [handleScroll]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const yOffset = -90; // smooth margin above heading
    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const isAtBottom = scrollPercent >= 98;

  return (
    <>
      {/* Mobile Top Minimal Reading Progress Bar */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-50 h-[3px] bg-black/10 dark:bg-white/10 pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="h-full bg-[var(--accent)] transition-all duration-150 ease-out"
          style={{ width: `${scrollPercent}%` }}
        />
      </div>

      {/* Desktop Compass-Scale Indicator: Full-Height Stretched Display Without Panel BG */}
      <nav
        aria-label="Compass Reading Indicator & Section Navigation"
        className="hidden md:flex fixed right-3 lg:right-6 top-0 bottom-0 h-screen z-40 flex-col items-end select-none py-10 sm:py-12 md:py-14 lg:py-16 pointer-events-none"
      >
        <div className="relative h-full w-full flex flex-col justify-between items-end pointer-events-auto">
          {/* Compass Header: Woodcut Pocket Compass & Real-Time Percentage */}
          <div className="flex items-center gap-2 mb-4 select-none shrink-0">
            <span className="font-mono text-[10px] font-bold text-[var(--accent)] tracking-widest">
              {scrollPercent}%
            </span>
            <div className="w-[22px] flex items-center justify-center">
              <img
                src="/theme/compass-light.png"
                alt="Compass Navigator"
                width={128}
                height={128}
                className="w-[20px] h-[20px] object-contain dark:hidden pointer-events-none"
              />
              <img
                src="/theme/compass-dark.png"
                alt="Compass Navigator"
                width={128}
                height={128}
                className="w-[20px] h-[20px] object-contain hidden dark:block pointer-events-none"
              />
            </div>
          </div>

          {/* Full-Height Stretched Graduated Compass Scale */}
          <div className="relative flex-1 w-full flex flex-col justify-between items-end my-1">
            {/* Vertical Compass Axis Line: Spans strictly from top horizontal tick to bottom horizontal tick */}
            <div
              className="absolute right-[10px] top-[14px] bottom-[14px] w-[1px] bg-stone-400 dark:bg-stone-800 -z-10"
              aria-hidden="true"
            />

            {sections.map((section, idx) => {
              const isActiveMajor = activeSectionIndex === idx;
              const isMajorReached = isAtBottom || activeSectionIndex >= idx;
              const numberLabel = String(idx + 1).padStart(2, "0");
              const isLast = idx === sections.length - 1;

              return (
                <div
                  key={section.id}
                  className={`w-full flex flex-col items-end ${
                    isLast ? "shrink-0" : "flex-1 flex justify-between"
                  }`}
                >
                  {/* Major Section Mark */}
                  <div className="relative group/tick flex items-center justify-end shrink-0">
                    <button
                      type="button"
                      onClick={() => scrollToSection(section.id)}
                      aria-label={`Jump to section ${numberLabel}: ${section.title}`}
                      className="cursor-pointer flex items-center justify-end gap-2.5 py-1 focus:outline-hidden"
                    >
                      {/* Section Number: Bolder & Accent when Active */}
                      <span
                        className={`font-mono transition-all duration-200 ${
                          isActiveMajor
                            ? "text-[11px] font-bold text-[var(--accent)] scale-105"
                            : isMajorReached
                              ? "text-[10px] font-medium text-[var(--accent)]/90"
                              : "text-[10px] text-[var(--ink-muted)] group-hover/tick:text-[var(--ink-primary)]"
                        }`}
                      >
                        {numberLabel}
                      </span>

                      {/* Horizontal Compass Line */}
                      <div className="w-[22px] flex items-center justify-end">
                        <span
                          className={`block rounded-l-full transition-all duration-200 ${
                            isActiveMajor
                              ? "w-8 h-[2.5px] bg-[var(--accent)] shadow-[0_0_8px_var(--accent)] mr-[10px]"
                              : isMajorReached
                                ? "w-5 h-[1.5px] bg-[var(--accent)]/80 mr-[10px]"
                                : "w-4 h-[1.5px] bg-stone-400/60 dark:bg-stone-600 group-hover/tick:w-6 group-hover/tick:bg-[var(--accent)] mr-[10px]"
                          }`}
                        />
                      </div>
                    </button>

                    {/* Hover Floating Tooltip with Section Title */}
                    <div
                      role="tooltip"
                      className="absolute right-full mr-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover/tick:opacity-100 group-hover/tick:translate-x-0 translate-x-1.5 transition-all duration-150 ease-out z-50 whitespace-nowrap"
                    >
                      <div className="flex items-center gap-2 px-2.5 py-1 rounded-xs bg-[var(--bg-page)] dark:bg-stone-900 border border-[var(--accent-border)] shadow-xl text-left">
                        <span className="font-mono text-[9px] text-[var(--accent)] font-bold">
                          {numberLabel}
                        </span>
                        <span className="font-serif text-xs text-[var(--ink-primary)] max-w-xs truncate">
                          {section.title}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Intermediate Compass Ticks between sections (sub-graduation lines stretched evenly) */}
                  {!isLast && (
                    <div
                      className="flex-1 flex flex-col justify-evenly items-end py-1 w-full"
                      aria-hidden="true"
                    >
                      {[0.25, 0.5, 0.75].map((threshold, subIdx) => {
                        const isSubReached =
                          isAtBottom ||
                          activeSectionIndex > idx ||
                          (activeSectionIndex === idx &&
                            activeSubTickFraction >= threshold);

                        const widthClass = subIdx === 1 ? "w-1.5" : "w-2.5";

                        return (
                          <div
                            key={subIdx}
                            className="w-[22px] flex items-center justify-end"
                          >
                            <span
                              className={`block rounded-l-xs transition-all duration-200 mr-[10px] ${
                                isSubReached
                                  ? `w-4 h-[1.5px] bg-[var(--accent)] dark:shadow-[0_0_6px_var(--accent)]`
                                  : `${widthClass} h-[1px] bg-stone-400/70 dark:bg-stone-700/60`
                              }`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Compass Footer: Smooth Return to Top */}
          <div className="flex items-center justify-end mt-4 select-none shrink-0">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              title="Return to top"
              aria-label="Return to top of manuscript"
              className="w-[22px] flex items-center justify-center text-stone-500 hover:text-[var(--accent)] dark:text-[var(--ink-muted)] dark:hover:text-[var(--accent)] transition-colors p-0 cursor-pointer"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
