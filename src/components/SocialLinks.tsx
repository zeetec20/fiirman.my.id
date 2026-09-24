import type React from "react";
import { bioData } from "@/data/bio";

interface SocialLinksProps {
  className?: string;
  variant?: "icons" | "pills";
}

function getSocialIcon(name: string): React.ReactNode {
  switch (name.toLowerCase()) {
    case "github":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-4 h-4"
          aria-hidden="true"
        >
          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-4 h-4"
          aria-hidden="true"
        >
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45c-.9 0-1.63.73-1.63 1.63s.73 1.63 1.63 1.63 1.63-.73 1.63-1.63c0-.9-.73-1.63-1.63-1.63Z" />
        </svg>
      );
    case "medium":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-4 h-4"
          aria-hidden="true"
        >
          <path d="M13.54 12a6.8 6.8 0 0 1-6.77 6.82A6.8 6.8 0 0 1 0 12a6.8 6.8 0 0 1 6.77-6.82A6.8 6.8 0 0 1 13.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
        </svg>
      );
    case "email":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4"
          aria-hidden="true"
        >
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      );
    default:
      return null;
  }
}

export function SocialLinks({
  className = "",
  variant = "icons",
}: SocialLinksProps) {
  if (variant === "icons") {
    return (
      <div className={`flex items-center gap-1.5 sm:gap-2.5 ${className}`}>
        {bioData.socials.map((s) => {
          const icon = getSocialIcon(s.name);
          return (
            <a
              key={s.name}
              href={s.url}
              target={s.url.startsWith("mailto:") ? undefined : "_blank"}
              rel={
                s.url.startsWith("mailto:") ? undefined : "noopener noreferrer"
              }
              aria-label={s.name}
              title={s.name}
              className="p-1.5 rounded-full text-[var(--ink-secondary)] hover:text-[var(--accent)] transition-colors focus:outline-hidden focus:ring-1 focus:ring-[var(--accent)]"
            >
              {icon}
            </a>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {bioData.socials.map((s) => (
        <a
          key={s.name}
          href={s.url}
          target={s.url.startsWith("mailto:") ? undefined : "_blank"}
          rel={s.url.startsWith("mailto:") ? undefined : "noopener noreferrer"}
          title={s.label}
          className="font-mono text-xs text-[var(--ink-secondary)] hover:text-[var(--accent)] transition-colors inline-flex items-center gap-1.5 px-2 py-1 rounded-xs border border-black/10 dark:border-white/10 hover:border-[var(--accent)]/40 hover:bg-[var(--accent-soft)]/20"
        >
          <span>{s.label}</span>
          {!s.url.startsWith("mailto:") && (
            <span className="text-[10px] opacity-60" aria-hidden="true">
              ↗
            </span>
          )}
        </a>
      ))}
    </div>
  );
}
