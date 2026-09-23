import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "data-theme"],
  });
  return () => {
    window.removeEventListener("storage", callback);
    observer.disconnect();
  };
}

function getSnapshot(): "light" | "dark" {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("dark") ||
    document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";
}

function getServerSnapshot(): "light" | "dark" {
  return "dark";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";

    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="group relative block w-12 h-12 sm:w-16 sm:h-16 cursor-pointer focus:outline-hidden focus-visible:ring-1 focus-visible:ring-[var(--accent)] select-none origin-top-right"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {/* Gentle Solar Flare Aura (Light Mode Hover - warm golden decay) */}
      <div
        aria-hidden="true"
        className={`absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 origin-top-right pointer-events-none transition-all duration-300 ease-out bg-[radial-gradient(circle_at_top_right,rgba(224,160,0,0.28)_0%,rgba(245,158,11,0.09)_45%,transparent_75%)] ${
          theme === "light"
            ? "opacity-0 group-hover:opacity-100 scale-100 group-hover:scale-104"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Luminous Lunar Glow (Dark Mode Hover - soft white moon radiance) */}
      <div
        aria-hidden="true"
        className={`absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 origin-top-right pointer-events-none transition-all duration-300 ease-out bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25)_0%,rgba(255,255,255,0.08)_45%,transparent_75%)] ${
          theme === "dark"
            ? "opacity-0 group-hover:opacity-100 scale-100 group-hover:scale-104"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* 90-Degree Corner Icon Presentation */}
      <div className="relative w-full h-full overflow-visible origin-top-right">
        {/* Golden Linocut Sun (Visible in Light Mode) */}
        <img
          src="/theme/sun-yellow-corner.png"
          alt="Celestial Sun (switch to dark mode)"
          width={400}
          height={400}
          loading="eager"
          decoding="sync"
          className={`absolute top-0 right-0 w-full h-full object-contain pointer-events-none theme-flare-sun origin-top-right ${
            theme === "light"
              ? "opacity-100 scale-100"
              : "opacity-0 scale-90 pointer-events-none"
          }`}
        />

        {/* Luminous White Moon (Visible in Dark Mode) */}
        <img
          src="/theme/moon-white-corner.png"
          alt="Lunar Moon (switch to light mode)"
          width={400}
          height={400}
          loading="eager"
          decoding="sync"
          className={`absolute top-0 right-0 w-full h-full object-contain pointer-events-none theme-flare-moon origin-top-right ${
            theme === "dark"
              ? "opacity-100 scale-100"
              : "opacity-0 scale-90 pointer-events-none"
          }`}
        />
      </div>
    </button>
  );
}
