import { DitherImage } from "./dither-image";

export { DitherImage };

interface AsciiArtProps {
  className?: string;
  src?: string;
  alt?: string;
}

/**
 * AsciiArt / Dither Effect
 * Re-exports DitherImage for real-time dynamic ordered dithering on any image source.
 */
export function AsciiArt({
  className = "",
  src = "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
  alt = "Dither artwork",
}: AsciiArtProps) {
  return <DitherImage src={src} alt={alt} className={className} />;
}
