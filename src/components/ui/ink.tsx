/**
 * Organic handwritten ink stroke SVG.
 * Simulates an imperfect quill / fountain pen ink line across archival paper.
 * Less mechanical than a straight CSS border; provides intentional, impactful rhythm.
 */
export function InkLine({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 500 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      className={`w-full h-[6px] overflow-visible text-stone-300 dark:text-[#3C3630] transition-colors duration-200 ${className}`}
      aria-hidden="true"
    >
      <path
        d="M 2 4.2 C 55 3.4, 120 4.8, 195 4.0 C 270 3.3, 345 4.7, 498 3.9"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M 6 4.5 C 95 4.1, 205 4.6, 315 4.2 C 370 4.0, 430 4.4, 494 4.1"
        stroke="currentColor"
        strokeWidth="0.6"
        strokeOpacity="0.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Minimal clean circular dot icon.
 * Replaces the droplet shape with a balanced, minimalist circle mark.
 */
export function InkDrop({
  className = "w-2.5 h-2.5 text-[var(--accent)]",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${className}`}
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="3.5" />
    </svg>
  );
}

/**
 * Masthead horizontal divider featuring imperfect handwritten ink strokes
 * meeting at a central wine-crimson ink drop.
 */
export function MastheadDivider({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative my-3 sm:my-4 flex items-center justify-center ${className}`}
    >
      <svg
        viewBox="0 0 600 8"
        fill="none"
        preserveAspectRatio="none"
        className="w-full h-[6px] text-stone-300 dark:text-[#3C3630] transition-colors duration-200"
        aria-hidden="true"
      >
        <path
          d="M 2 4 C 60 3.2, 140 4.6, 230 3.8 C 265 3.5, 282 4.1, 290 4.0"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M 310 4.0 C 318 4.1, 335 3.5, 370 3.8 C 460 4.6, 540 3.2, 598 4"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex items-center justify-center pointer-events-none">
        <InkDrop className="w-2.5 h-2.5 text-[var(--accent)]" />
      </div>
    </div>
  );
}
