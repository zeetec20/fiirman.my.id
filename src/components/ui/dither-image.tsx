import { useEffect, useRef, useState } from "react";

// 8x8 Bayer Ordered Dither Matrix
const BAYER_8X8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

// Color palette definitions:
// Dark base: #0A0908
const COLOR_DARK = [10, 9, 8];
// Amber midtone: #FFB930
const COLOR_AMBER = [255, 185, 48];
// Cream ink highlight: #EDE7DC
const COLOR_CREAM = [237, 231, 220];

interface DitherImageProps {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  srcSet?: string;
  pixelSize?: number;
  hoverReveal?: boolean;
}

export function DitherImage({
  src,
  alt,
  className = "",
  priority = false,
  sizes,
  srcSet,
  pixelSize = 2,
  hoverReveal = true,
}: DitherImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isDithered, setIsDithered] = useState(false);
  const [ditherReady, setDitherReady] = useState(false);

  const basePath = src.replace(/\.[^.]+$/, "");
  const isArticleImage = src.startsWith("/article/");
  const effectiveSrc =
    isArticleImage && !src.endsWith(".webp") ? `${basePath}.webp` : src;
  const effectiveSrcSet =
    srcSet ||
    (isArticleImage
      ? `${basePath}-320w.webp 320w, ${basePath}-480w.webp 480w, ${basePath}-672w.webp 672w, ${basePath}-768w.webp 768w`
      : undefined);
  const effectiveSizes =
    sizes ||
    (priority
      ? "(min-width: 1024px) 500px, (min-width: 768px) 45vw, 100vw"
      : undefined);

  const [currentSrc, setCurrentSrc] = useState(effectiveSrc);
  const [currentSrcSet, setCurrentSrcSet] = useState<string | undefined>(
    effectiveSrcSet,
  );

  useEffect(() => {
    setCurrentSrc(effectiveSrc);
    setCurrentSrcSet(effectiveSrcSet);
  }, [effectiveSrc, effectiveSrcSet]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (priority) {
      if (typeof window === "undefined") return;
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
        const id = ric.call(window, () => setDitherReady(true), {
          timeout: 1500,
        });
        return () => window.cancelIdleCallback?.(id);
      }
      const tid = window.setTimeout(() => setDitherReady(true), 250);
      return () => window.clearTimeout(tid);
    }
    if (typeof IntersectionObserver === "undefined") {
      const schedule =
        typeof window !== "undefined" &&
        typeof (
          window as Window & {
            requestIdleCallback?: (cb: () => void) => number;
          }
        ).requestIdleCallback === "function"
          ? (
              window as Window & {
                requestIdleCallback: (cb: () => void) => number;
              }
            ).requestIdleCallback
          : (cb: () => void) => window.setTimeout(cb, 800);
      schedule(() => setDitherReady(true));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          const ric = (
            window as Window & {
              requestIdleCallback?: (
                cb: () => void,
                opts?: { timeout: number },
              ) => number;
            }
          ).requestIdleCallback;
          if (typeof ric === "function") {
            ric.call(window, () => setDitherReady(true), { timeout: 2000 });
          } else {
            window.setTimeout(() => setDitherReady(true), 300);
          }
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, [priority]);

  useEffect(() => {
    if (!ditherReady) return;
    let isCancelled = false;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const imgEl = imgRef.current;
    if (!container || !canvas || !imgEl) return;

    const processDither = () => {
      if (isCancelled) return;
      const rect = container.getBoundingClientRect();
      const width = Math.floor(rect.width || 300);
      const height = Math.floor(rect.height || 200);

      if (width === 0 || height === 0) return;

      const sampleW = Math.max(1, Math.floor(width / pixelSize));
      const sampleH = Math.max(1, Math.floor(height / pixelSize));

      const sourceSrc = imgEl.currentSrc || currentSrc;
      if (!sourceSrc) return;

      // Offscreen unconstrained image instance to obtain true physical buffer dimensions
      // directly from browser memory cache without CSS density scaling or sizes distortion
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.src = sourceSrc;

      const renderDither = () => {
        if (isCancelled) return;
        const offscreen = document.createElement("canvas");
        offscreen.width = sampleW;
        offscreen.height = sampleH;
        const offCtx = offscreen.getContext("2d", { willReadFrequently: true });
        if (!offCtx) return;

        const naturalW = img.naturalWidth || sampleW;
        const naturalH = img.naturalHeight || sampleH;
        const imgAspect = naturalW / naturalH;
        const targetAspect = sampleW / sampleH;
        let sx = 0,
          sy = 0,
          sw = naturalW,
          sh = naturalH;

        if (imgAspect > targetAspect) {
          sw = naturalH * targetAspect;
          sx = (naturalW - sw) / 2;
        } else {
          sh = naturalW / targetAspect;
          sy = (naturalH - sh) / 2;
        }

        offCtx.drawImage(img, sx, sy, sw, sh, 0, 0, sampleW, sampleH);

        try {
          const imgData = offCtx.getImageData(0, 0, sampleW, sampleH);
          const data = imgData.data;

          for (let y = 0; y < sampleH; y++) {
            for (let x = 0; x < sampleW; x++) {
              const idx = (y * sampleW + x) * 4;
              const r = data[idx];
              const g = data[idx + 1];
              const b = data[idx + 2];

              const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
              const bayerVal = BAYER_8X8[y % 8][x % 8] / 64 - 0.5;
              const thresholded = lum + bayerVal * 0.38;

              let chosenColor: number[];
              if (thresholded < 0.28) {
                chosenColor = COLOR_DARK;
              } else if (thresholded < 0.65) {
                chosenColor = COLOR_AMBER;
              } else {
                chosenColor = COLOR_CREAM;
              }

              data[idx] = chosenColor[0];
              data[idx + 1] = chosenColor[1];
              data[idx + 2] = chosenColor[2];
              data[idx + 3] = 255;
            }
          }

          offCtx.putImageData(imgData, 0, 0);

          canvas.width = sampleW;
          canvas.height = sampleH;
          const mainCtx = canvas.getContext("2d");
          if (mainCtx) {
            mainCtx.drawImage(offscreen, 0, 0);
            setIsDithered(true);
          }
        } catch (err) {
          console.warn("Dither canvas processing fallback:", err);
        }
      };

      if (img.complete && img.naturalWidth > 0) {
        renderDither();
      } else {
        img.onload = renderDither;
      }
    };

    const scheduleDither = () => {
      if (typeof window !== "undefined") {
        const ric = (
          window as Window & {
            requestIdleCallback?: (cb: () => void) => number;
          }
        ).requestIdleCallback;
        if (typeof ric === "function") {
          ric.call(window, processDither);
          return;
        }
      }
      setTimeout(processDither, 16);
    };

    if (imgEl.complete && imgEl.naturalWidth > 0) {
      scheduleDither();
    } else {
      imgEl.addEventListener("load", scheduleDither, { once: true });
    }

    const observer = new ResizeObserver(() => {
      if (imgEl.complete && imgEl.naturalWidth > 0) {
        scheduleDither();
      }
    });
    observer.observe(container);

    return () => {
      isCancelled = true;
      observer.disconnect();
    };
  }, [pixelSize, ditherReady, currentSrc]);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      {/* Base standard image with modern responsive WebP format */}
      <img
        ref={imgRef}
        src={currentSrc}
        srcSet={currentSrcSet}
        sizes={effectiveSizes}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding={priority ? "sync" : "async"}
        crossOrigin="anonymous"
        onError={() => {
          if (currentSrc !== src) {
            setCurrentSrc(src);
            setCurrentSrcSet(undefined);
          }
        }}
        className={`w-full h-full object-cover ${className}`}
      />

      {/* Real-time Dynamic Bayer Dither Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-500 ${
          isDithered ? "opacity-100" : "opacity-0"
        } ${hoverReveal ? "group-hover:opacity-0" : ""}`}
        style={{
          imageRendering: "pixelated",
          objectFit: "cover",
        }}
      />
    </div>
  );
}
