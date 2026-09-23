import { ScanStamp } from "@/components/ScanStamp";

interface SectionHeaderProps {
  title: string;
  dek?: string;
  stampLabel?: string;
  stampSublabel?: string;
  className?: string;
}

export function SectionHeader({
  title,
  dek,
  stampLabel,
  stampSublabel,
  className = "",
}: SectionHeaderProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-2 ${className}`}
    >
      <div className="space-y-1">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ink-primary)]">
          {title}
        </h2>
        {dek && (
          <p className="font-serif italic text-xs sm:text-sm text-[var(--ink-secondary)] leading-relaxed max-w-2xl">
            {dek}
          </p>
        )}
      </div>
      {stampLabel && (
        <div className="shrink-0 self-start">
          <ScanStamp label={stampLabel} sublabel={stampSublabel} />
        </div>
      )}
    </div>
  );
}
