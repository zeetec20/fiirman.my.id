import { DitherImage } from "@/components/ui/dither-image";
import { bioData } from "@/data/bio";

interface AuthorPortraitProps {
  className?: string;
}

export function AuthorPortrait({ className = "" }: AuthorPortraitProps) {
  return (
    <div
      className={`group relative w-44 sm:w-52 aspect-square rounded-xs overflow-hidden shadow-smooth-lg bg-black/40 ${className}`}
    >
      <DitherImage
        src={bioData.avatar}
        alt={bioData.name}
        priority
        hoverReveal={true}
        pixelSize={2}
        className="object-cover filter contrast-[1.08] brightness-[0.92]"
      />
    </div>
  );
}
