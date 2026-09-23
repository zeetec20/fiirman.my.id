import { GrainGradient } from "@paper-design/shaders-react";
import { useSyncExternalStore } from "react";

function subscribeTheme(callback: () => void) {
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

function getThemeSnapshot() {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("dark") ||
    document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";
}

function getServerThemeSnapshot() {
  return "dark";
}

export function GradientBackground() {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );
  const isDark = theme === "dark";

  return (
    <>
      <div className="fixed inset-0 w-screen h-screen -z-20 overflow-hidden pointer-events-none select-none">
        <GrainGradient
          key={theme}
          style={{ height: "100vh", width: "100vw" }}
          colorBack={isDark ? "hsl(0, 0%, 0%)" : "hsl(38, 24%, 90%)"}
          softness={0.76}
          intensity={0.45}
          noise={isDark ? 0.08 : 0.12}
          shape="corners"
          offsetX={0}
          offsetY={0}
          scale={1}
          rotation={0}
          speed={1}
          colors={
            isDark
              ? ["hsl(40, 100%, 59%)", "hsl(30, 95%, 48%)", "hsl(48, 95%, 55%)"]
              : ["hsl(36, 60%, 75%)", "hsl(28, 56%, 72%)", "hsl(42, 52%, 76%)"]
          }
        />
      </div>
      {/* Vignette Scrim for Crystal-Clear Text Readability */}
      <div
        className="fixed inset-0 -z-10 bg-stone-900/5 dark:bg-black/65 pointer-events-none transition-colors duration-200"
        aria-hidden="true"
      />
    </>
  );
}

export { GradientBackground as PaperDesignShaderBackground };
