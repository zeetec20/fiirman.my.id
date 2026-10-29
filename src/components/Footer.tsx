import { ExternalLink } from "lucide-react";
import { SocialLinks } from "@/components/SocialLinks";
import { InkLine } from "@/components/ui/ink";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 pt-6 font-mono">
      {/* Editorial Ink Line Divider */}
      <div className="w-full mb-6">
        <InkLine />
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--ink-muted)]">
        {/* Copyright notice and repository link */}
        <div className="flex flex-col items-center sm:items-start gap-1 text-center sm:text-left">
          <div className="text-[10px] sm:text-[11px] tracking-wider uppercase">
            &copy; {currentYear} FIRMAN LESTARI - ALL RIGHTS RESERVED
          </div>
          <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] tracking-wider text-[var(--accent)] font-mono">
            <span className="text-[var(--ink-muted)]">
              CODE &amp; DOCUMENTATION:
            </span>
            <a
              href="https://github.com/zeetec20/fiirman.my.id"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:underline"
            >
              <span>GITHUB.COM/ZEETEC20/FIIRMAN.MY.ID</span>
              <ExternalLink className="w-2.5 h-2.5 inline-block" />
            </a>
          </div>
        </div>

        {/* Reusable Verified Social Media Links */}
        <SocialLinks />
      </div>
    </footer>
  );
};
