import { Image as ImageIcon, Maximize2, X } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface ImageFrameProps {
  src?: string;
  alt?: string;
  filename?: string;
  badge?: string;
  caption?: string;
  children: ReactNode;
  className?: string;
}

export function ImageFrame({
  src,
  alt,
  filename,
  badge,
  caption,
  children,
  className = "",
}: ImageFrameProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [mounted, setMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isMaximized) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMaximized(false);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsMaximized(false);
      }
    };

    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.body.style.overflow = origOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMaximized]);

  const displayTitle =
    alt?.trim() || caption?.trim() || filename || "IMAGE ASSET";

  return (
    <figure
      className={`my-6 backdrop-blur-md bg-white/25 dark:bg-white/[0.04] border border-black/[0.07] dark:border-white/[0.1] overflow-hidden rounded-xs transition-all shadow-smooth-md ${className}`}
    >
      {/* Code Header Bar (Uses alt text / caption first, then filename) */}
      <div className="px-3.5 py-2 backdrop-blur-sm bg-white/20 dark:bg-white/[0.04] border-b border-black/[0.07] dark:border-white/[0.1] flex items-center justify-between gap-3 text-xs select-none">
        <div className="flex items-center gap-2 min-w-0">
          <ImageIcon className="w-3.5 h-3.5 shrink-0 text-[var(--accent)]" />
          <span
            className="font-mono text-[11px] text-[var(--ink-secondary)] truncate"
            title={displayTitle}
          >
            {displayTitle}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {badge && (
            <span className="px-1.5 py-0.5 rounded-xs bg-black/5 dark:bg-white/5 border border-black/[0.05] dark:border-white/[0.08] font-mono text-[10px] text-[var(--ink-muted)] tracking-wider uppercase">
              {badge}
            </span>
          )}

          <button
            type="button"
            onClick={() => setIsMaximized(true)}
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs backdrop-blur-sm bg-white/30 dark:bg-white/[0.06] border border-black/[0.07] dark:border-white/[0.1] hover:bg-white/50 dark:hover:bg-white/[0.12] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] font-mono text-[10px] tracking-wider transition-all cursor-pointer"
            aria-label="Maximize image"
          >
            <Maximize2 className="w-3 h-3 opacity-70" />
            <span className="hidden sm:inline">MAXIMIZE</span>
          </button>
        </div>
      </div>

      {/* Media Viewport with Zoom Click */}
      <button
        type="button"
        className="relative w-full overflow-hidden bg-black/5 dark:bg-black/30 cursor-zoom-in group/img block text-left p-0 border-0"
        onClick={() => setIsMaximized(true)}
        aria-label={`Maximize image: ${filename || "asset"}`}
      >
        {children}
      </button>

      {/* Maximize Lightbox Modal */}
      {isMaximized &&
        mounted &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Maximized view of ${filename || "image"}`}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 animate-fade-in"
          >
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-xs transition-opacity duration-300" />

            {/* Modal Dialog Content Container (Glass Card) */}
            <div
              ref={modalRef}
              className="relative z-10 max-w-5xl lg:max-w-6xl w-full max-h-[92vh] flex flex-col rounded-xs overflow-hidden backdrop-blur-xl bg-white/40 dark:bg-stone-950/40 border border-black/[0.07] dark:border-white/[0.1] shadow-smooth-lg ring-1 ring-black/5 dark:ring-white/5 cursor-default transition-all"
            >
              {/* Top Bar: Title & Close Button */}
              <div className="w-full flex items-center justify-between gap-3 px-4 py-2.5 border-b border-black/[0.07] dark:border-white/[0.1] backdrop-blur-md bg-white/20 dark:bg-white/[0.03] font-mono select-none">
                <div className="flex items-center gap-2 min-w-0">
                  <ImageIcon className="w-4 h-4 text-[var(--accent)] shrink-0" />
                  <span className="text-[10px] sm:text-[11px] font-medium text-[var(--ink-secondary)] uppercase tracking-wider truncate">
                    {displayTitle}
                  </span>
                  {badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-xs bg-black/5 dark:bg-white/5 border border-black/[0.05] dark:border-white/[0.08] text-[var(--ink-muted)]">
                      {badge}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsMaximized(false)}
                  className="p-1 rounded-xs hover:bg-black/5 dark:hover:bg-white/10 text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] transition-colors cursor-pointer shrink-0"
                  aria-label="Close image modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* High-Resolution Maximized Image */}
              <div className="relative w-full max-h-[82vh] overflow-auto p-4 flex items-center justify-center bg-black/5 dark:bg-black/20">
                <img
                  src={src}
                  alt={alt || filename || "Maximized image"}
                  className="max-h-[78vh] max-w-full w-auto h-auto object-contain rounded-xs"
                />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </figure>
  );
}
