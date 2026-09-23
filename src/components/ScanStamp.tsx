interface ScanStampProps {
  label: string;
  sublabel?: string;
  className?: string;
}

export function ScanStamp({ label, sublabel, className = "" }: ScanStampProps) {
  return (
    <div
      className={`rubber-stamp select-none text-center ${className}`}
      aria-label={`${label} ${sublabel || ""}`}
    >
      <span className="text-[10px] sm:text-[11px] tracking-widest font-mono">
        {label}
      </span>
      {sublabel && (
        <span className="text-[8px] sm:text-[9px] tracking-wider opacity-85 font-mono">
          {sublabel}
        </span>
      )}
    </div>
  );
}
