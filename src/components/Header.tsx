import { Link, useRouterState } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/ThemeToggle";
import { InkDrop, MastheadDivider } from "@/components/ui/ink";

declare const __BUILD_TIMESTAMP__: string | undefined;

export function Header() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const buildDateline =
    typeof __BUILD_TIMESTAMP__ !== "undefined"
      ? __BUILD_TIMESTAMP__
      : "XXIII · IX · MMXXVI";

  return (
    <header className="relative w-full pt-4 pb-4 select-none">
      {/* Top Right Corner Theme Switcher */}
      <div className="absolute top-0 right-0 z-20">
        <ThemeToggle />
      </div>

      {/* Main Newspaper Masthead */}
      <div className="text-center pt-2 pb-2">
        <Link to="/" className="inline-block group">
          <h1 className="font-gothic text-4xl sm:text-5xl md:text-6xl text-[var(--ink-primary)] tracking-normal leading-tight hover:opacity-90 transition-opacity drop-shadow-xs">
            Firman Lestari
          </h1>
        </Link>
        <p className="font-serif italic text-xs sm:text-sm text-[var(--ink-secondary)] tracking-widest mt-0.5">
          De Litteris et Codicibus
        </p>

        {/* Dateline with Roman Numeral Date, Indonesian Location, and Handle */}
        <div className="font-mono text-[9px] sm:text-[10px] text-[var(--ink-muted)] tracking-[0.2em] uppercase mt-2.5">
          DEPLOYED: {buildDateline} // BANYUWANGI, INDONESIA // ZEETEC20
        </div>
      </div>

      {/* Handwritten Ink Stroke Masthead Divider with Central Ink Drop */}
      <MastheadDivider />

      {/* Classical Newspaper Navigation Bar strictly using font-mono */}
      <nav className="flex items-center justify-center gap-3 sm:gap-6 py-1 pl-[1px] font-mono text-[10px] sm:text-[11px] tracking-[0.2em] uppercase">
        <Link
          to="/"
          className={`transition-colors flex flex-col items-center ${
            pathname === "/"
              ? "text-[var(--ink-primary)] font-semibold"
              : "text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
          }`}
        >
          <span className="text-[9px] text-[var(--ink-muted)] tracking-wider font-mono">
            HOME
          </span>
          <span className={pathname === "/" ? "text-[var(--accent)]" : ""}>
            FRONTISPIECE
          </span>
        </Link>

        <InkDrop className="w-2 h-2 text-[var(--accent)] opacity-75" />

        <Link
          to="/articles"
          className={`transition-colors flex flex-col items-center ${
            pathname.startsWith("/articles")
              ? "text-[var(--ink-primary)] font-semibold"
              : "text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
          }`}
        >
          <span className="text-[9px] text-[var(--ink-muted)] tracking-wider font-mono">
            ARTICLES
          </span>
          <span
            className={
              pathname.startsWith("/articles") ? "text-[var(--accent)]" : ""
            }
          >
            FOLIOS
          </span>
        </Link>

        <InkDrop className="w-2 h-2 text-[var(--accent)] opacity-75" />

        <Link
          to="/projects"
          className={`transition-colors flex flex-col items-center ${
            pathname.startsWith("/projects")
              ? "text-[var(--ink-primary)] font-semibold"
              : "text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
          }`}
        >
          <span className="text-[9px] text-[var(--ink-muted)] tracking-wider font-mono">
            PROJECTS
          </span>
          <span
            className={
              pathname.startsWith("/projects") ? "text-[var(--accent)]" : ""
            }
          >
            SHOWCASE
          </span>
        </Link>

        <InkDrop className="w-2 h-2 text-[var(--accent)] opacity-75" />

        <Link
          to="/about"
          className={`transition-colors flex flex-col items-center ${
            pathname.startsWith("/about") || pathname.startsWith("/bio")
              ? "text-[var(--ink-primary)] font-semibold"
              : "text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
          }`}
        >
          <span className="text-[9px] text-[var(--ink-muted)] tracking-wider font-mono">
            ABOUT
          </span>
          <span
            className={
              pathname.startsWith("/about") || pathname.startsWith("/bio")
                ? "text-[var(--accent)]"
                : ""
            }
          >
            THE AUTHOR
          </span>
        </Link>
      </nav>
    </header>
  );
}
