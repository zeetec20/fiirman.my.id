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
  pixelSize?: number;
  hoverReveal?: boolean;
}

export function DitherImage({
  src,
  alt,
  className = "",
  priority = false,
  pixelSize = 2,
  hoverReveal = true,
}: DitherImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDithered, setIsDithered] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = src;

    const processDither = () => {
      if (isCancelled) return;
      const rect = container.getBoundingClientRect();
      const width = Math.floor(rect.width || 300);
      const height = Math.floor(rect.height || 200);

      if (width === 0 || height === 0) return;

      // Downscaled resolution according to pixelSize for authentic retro chunky grain
      const sampleW = Math.max(1, Math.floor(width / pixelSize));
      const sampleH = Math.max(1, Math.floor(height / pixelSize));

      const offscreen = document.createElement("canvas");
      offscreen.width = sampleW;
      offscreen.height = sampleH;
      const offCtx = offscreen.getContext("2d", { willReadFrequently: true });
      if (!offCtx) return;

      // Draw and crop image with object-fit: cover equivalent
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const targetAspect = sampleW / sampleH;
      let sx = 0,
        sy = 0,
        sw = img.naturalWidth,
        sh = img.naturalHeight;

      if (imgAspect > targetAspect) {
        sw = img.naturalHeight * targetAspect;
        sx = (img.naturalWidth - sw) / 2;
      } else {
        sh = img.naturalWidth / targetAspect;
        sy = (img.naturalHeight - sh) / 2;
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

            // Perceptual grayscale luminance
            const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

            // 8x8 Bayer threshold (-0.5 to +0.5)
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
        // In case of CORS or canvas restrictions, fallback seamlessly to base image
        console.warn("Dither canvas processing fallback:", err);
      }
    };

    if (img.complete && img.naturalWidth > 0) {
      processDither();
    } else {
      img.onload = processDither;
    }

    const observer = new ResizeObserver(() => {
      if (img.complete && img.naturalWidth > 0) {
        processDither();
      }
    });
    observer.observe(container);

    return () => {
      isCancelled = true;
      observer.disconnect();
    };
  }, [src, pixelSize]);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      {/* Base standard image for zero-dependency universal rendering */}
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
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
