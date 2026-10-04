import {
  lazy,
  Suspense,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";

const LazyGrainGradient = lazy(() =>
  import("@/components/ui/shader-canvas").then((m) => ({
    default: m.GrainGradientBackground,
  })),
);

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

function StaticGradientFallback({ isDark }: { isDark: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="transition-colors duration-200"
      style={{
        height: "100vh",
        width: "100vw",
        background: isDark
          ? "radial-gradient(120% 120% at 0% 0%, hsl(40, 100%, 59%) 0%, hsl(30, 95%, 48%) 45%, hsl(48, 95%, 55%) 70%, hsl(0, 0%, 0%) 100%)"
          : "radial-gradient(120% 120% at 0% 0%, hsl(36, 60%, 75%) 0%, hsl(28, 56%, 72%) 45%, hsl(42, 52%, 76%) 70%, hsl(38, 24%, 90%) 100%)",
      }}
    />
  );
}

function scheduleIdle(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const ric = (
    window as Window & {
      requestIdleCallback?: (
        cb: () => void,
        opts?: { timeout: number },
      ) => number;
      cancelIdleCallback?: (id: number) => void;
    }
  ).requestIdleCallback;
  if (typeof ric === "function") {
    const id = ric.call(window, callback, { timeout: 6000 });
    return () => {
      window.cancelIdleCallback?.(id);
    };
  }
  const id = window.setTimeout(callback, 5000);
  return () => window.clearTimeout(id);
}

export function GradientBackground() {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );
  const isDark = theme === "dark";
  const [upgradeShader, setUpgradeShader] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    return scheduleIdle(() => setUpgradeShader(true));
  }, []);

  return (
    <>
      <div className="fixed inset-0 w-screen h-screen -z-20 overflow-hidden pointer-events-none select-none">
        {upgradeShader ? (
          <Suspense fallback={<StaticGradientFallback isDark={isDark} />}>
            <LazyGrainGradient />
          </Suspense>
        ) : (
          <StaticGradientFallback isDark={isDark} />
        )}
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
