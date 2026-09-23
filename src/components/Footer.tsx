import { SocialLinks } from "@/components/SocialLinks";
import { InkLine } from "@/components/ui/ink";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 pt-6 select-none font-mono">
      {/* Editorial Ink Line Divider */}
      <div className="w-full mb-6">
        <InkLine />
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--ink-muted)]">
        {/* Copyright notice */}
        <div className="text-[10px] sm:text-[11px] tracking-wider uppercase text-center sm:text-left">
          &copy; {currentYear} FIRMAN LESTARI - ALL RIGHTS RESERVED
        </div>

        {/* Reusable Verified Social Media Links */}
        <SocialLinks />
      </div>
    </footer>
  );
}
