import hljs from "highlight.js";
import { Check, Copy } from "lucide-react";
import { useMemo, useState } from "react";
import {
  getLanguageDisplayName,
  LanguageIcon,
} from "@/components/LanguageIcon";
import { detectCodeLanguage } from "@/lib/detect-language";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
}

export function CodeBlock({
  code,
  language,
  filename,
  showLineNumbers = true,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  // Compute effective language using smart detector when language is unassigned or generic text
  const effectiveLang = useMemo(() => {
    const trimmed = (language || "").trim().toLowerCase();
    if (trimmed && trimmed !== "text" && trimmed !== "plaintext") {
      return trimmed;
    }
    const detected = detectCodeLanguage(code);
    return detected !== "text" ? detected : trimmed || "text";
  }, [code, language]);

  // Normalize language for display and highlighting
  const displayName = getLanguageDisplayName(effectiveLang);
  const normalizedLang = effectiveLang.toLowerCase().trim();

  // Highlight syntax using highlight.js
  const highlightedHtml = useMemo(() => {
    try {
      if (
        normalizedLang &&
        normalizedLang !== "text" &&
        hljs.getLanguage(normalizedLang)
      ) {
        return hljs.highlight(code, {
          language: normalizedLang,
          ignoreIllegals: true,
        }).value;
      }
      return code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    } catch {
      // Fallback: safely escape text
      return code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }
  }, [code, normalizedLang]);

  // Generate line numbers
  const lines = useMemo(() => code.split("\n"), [code]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  return (
    <div className="my-6 backdrop-blur-md bg-white/25 dark:bg-white/[0.04] border border-black/[0.07] dark:border-white/[0.1] overflow-hidden rounded-xs transition-all">
      {/* Code Header Bar */}
      <div className="px-3.5 py-2 backdrop-blur-sm bg-white/20 dark:bg-white/[0.04] border-b border-black/[0.07] dark:border-white/[0.1] flex items-center justify-between gap-3 text-xs select-none">
        {/* Left: Language Icon + Language Name + Filename */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <LanguageIcon
              language={normalizedLang}
              className="w-3.5 h-3.5 shrink-0"
            />
            <span className="font-mono text-xs font-semibold text-[var(--ink-primary)] tracking-wide">
              {displayName}
            </span>
          </div>

          {filename && (
            <>
              <span
                className="text-black/25 dark:text-white/25 font-mono select-none"
                aria-hidden="true"
              >
                /
              </span>
              <span
                className="font-mono text-[11px] text-[var(--ink-muted)] truncate"
                title={filename}
              >
                {filename}
              </span>
            </>
          )}
        </div>

        {/* Right: Copy Button */}
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs backdrop-blur-sm bg-white/30 dark:bg-white/[0.06] border border-black/[0.07] dark:border-white/[0.1] hover:bg-white/50 dark:hover:bg-white/[0.12] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] font-mono text-[10px] tracking-wider transition-all cursor-pointer shrink-0"
          aria-label={
            copied ? "Code copied to clipboard" : "Copy code to clipboard"
          }
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-[#15803D] dark:text-[#34D399]" />
              <span className="text-[#15803D] dark:text-[#34D399] font-bold">
                COPIED
              </span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 opacity-70" />
              <span>COPY</span>
            </>
          )}
        </button>
      </div>

      {/* Code Area with optional Line Numbers */}
      <div className="flex text-xs sm:text-[13px] font-mono leading-relaxed p-4 overflow-x-auto">
        {showLineNumbers && (
          <div
            className="select-none pr-3.5 mr-3.5 text-right text-stone-400/70 dark:text-stone-600/70 border-r border-black/[0.07] dark:border-white/[0.08] flex flex-col shrink-0 font-mono text-[11px] select-none"
            aria-hidden="true"
          >
            {lines.map((_, i) => (
              <span key={i} className="leading-relaxed">
                {i + 1}
              </span>
            ))}
          </div>
        )}

        <pre className="flex-1 overflow-visible font-mono text-[var(--ink-primary)] leading-relaxed m-0 p-0 bg-transparent">
          <code
            className={`font-mono hljs language-${normalizedLang}`}
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        </pre>
      </div>
    </div>
  );
}
