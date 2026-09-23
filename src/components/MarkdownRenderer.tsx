import { ExternalLink } from "lucide-react";
import { marked, type Token, type Tokens } from "marked";
import React, { useMemo } from "react";
import { CodeBlock } from "@/components/CodeBlock";
import { InkLine } from "@/components/ui/ink";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function InlineTokens({ tokens }: { tokens?: Token[] }) {
  if (!tokens || tokens.length === 0) return null;

  return (
    <>
      {tokens.map((token, i) => {
        const key = `inline-${i}-${token.type}`;

        switch (token.type) {
          case "text":
            return (
              <React.Fragment key={key}>
                {(token as Tokens.Text).tokens ? (
                  <InlineTokens tokens={(token as Tokens.Text).tokens} />
                ) : (
                  (token as Tokens.Text).text
                )}
              </React.Fragment>
            );

          case "strong":
            return (
              <strong key={key} className="font-bold text-[var(--ink-primary)]">
                <InlineTokens tokens={(token as Tokens.Strong).tokens} />
              </strong>
            );

          case "em":
            return (
              <em key={key} className="italic">
                <InlineTokens tokens={(token as Tokens.Em).tokens} />
              </em>
            );

          case "codespan":
            return (
              <code
                key={key}
                className="px-1.5 py-0.5 rounded-xs backdrop-blur-sm bg-white/30 dark:bg-white/[0.06] border border-black/[0.07] dark:border-white/[0.1] font-mono text-[0.85em] text-[#B45309] dark:text-[var(--accent)] font-medium"
              >
                {(token as Tokens.Codespan).text}
              </code>
            );

          case "link": {
            const linkToken = token as Tokens.Link;
            const isExternal =
              linkToken.href.startsWith("http://") ||
              linkToken.href.startsWith("https://");

            return (
              <a
                key={key}
                href={linkToken.href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className="text-[var(--accent)] hover:text-[#b37a00] dark:hover:text-[#ffd27a] underline underline-offset-4 decoration-[var(--accent)]/50 hover:decoration-[var(--accent)] transition-all font-medium inline-flex items-center gap-1 cursor-pointer"
              >
                <InlineTokens tokens={linkToken.tokens} />
                {isExternal && (
                  <ExternalLink className="w-3 h-3 inline-block shrink-0 opacity-75" />
                )}
              </a>
            );
          }

          case "image": {
            const imgToken = token as Tokens.Image;
            return (
              <span key={key} className="inline-block my-2">
                <img
                  src={imgToken.href}
                  alt={imgToken.text}
                  className="rounded-xs max-w-full h-auto"
                />
              </span>
            );
          }

          case "br":
            return <br key={key} />;

          default:
            return (
              <span key={key}>{"text" in token ? String(token.text) : ""}</span>
            );
        }
      })}
    </>
  );
}

function BlockToken({ token, index }: { token: Token; index: number }) {
  const key = `block-${index}-${token.type}`;

  switch (token.type) {
    case "heading": {
      const hToken = token as Tokens.Heading;
      const rawText = hToken.text;
      const cleanTitle = rawText
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/[*_`#]/g, "")
        .trim();
      const id = slugify(cleanTitle);

      if (hToken.depth === 1) {
        return (
          <h1
            key={key}
            id={id}
            className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[var(--ink-primary)] leading-tight mt-10 mb-6 scroll-mt-24"
          >
            <InlineTokens tokens={hToken.tokens} />
          </h1>
        );
      }

      if (hToken.depth === 2) {
        return (
          <h2
            key={key}
            id={id}
            className="font-serif text-2xl sm:text-3xl font-bold text-[var(--ink-primary)] mt-10 mb-4 pt-4 border-t border-[var(--divider-subtle)] first:border-0 first:pt-0 scroll-mt-24"
          >
            <InlineTokens tokens={hToken.tokens} />
          </h2>
        );
      }

      if (hToken.depth === 3) {
        return (
          <h3
            key={key}
            id={id}
            className="font-serif text-xl sm:text-2xl font-semibold text-[var(--ink-primary)] mt-8 mb-3 scroll-mt-24"
          >
            <InlineTokens tokens={hToken.tokens} />
          </h3>
        );
      }

      return (
        <h4
          key={key}
          id={id}
          className="font-serif text-lg font-medium text-[var(--ink-primary)] mt-6 mb-2 scroll-mt-24"
        >
          <InlineTokens tokens={hToken.tokens} />
        </h4>
      );
    }

    case "paragraph": {
      const pToken = token as Tokens.Paragraph;
      return (
        <p
          key={key}
          className="my-5 text-base sm:text-lg font-serif text-[var(--ink-primary)] leading-[1.8]"
        >
          <InlineTokens tokens={pToken.tokens} />
        </p>
      );
    }

    case "list": {
      const listToken = token as Tokens.List;
      if (listToken.ordered) {
        return (
          <ol
            key={key}
            className="my-5 space-y-2.5 pl-6 list-decimal marker:font-mono marker:text-[var(--accent)] marker:font-semibold text-base sm:text-lg text-[var(--ink-primary)] leading-relaxed"
          >
            {listToken.items.map((item, i) => (
              <li key={`li-${i}`} className="pl-1 leading-relaxed">
                <InlineTokens tokens={item.tokens} />
              </li>
            ))}
          </ol>
        );
      }

      return (
        <ul
          key={key}
          className="my-5 space-y-2.5 pl-6 list-disc marker:text-[var(--accent)] text-base sm:text-lg text-[var(--ink-primary)] leading-relaxed"
        >
          {listToken.items.map((item, i) => (
            <li key={`li-${i}`} className="pl-1 leading-relaxed">
              <InlineTokens tokens={item.tokens} />
            </li>
          ))}
        </ul>
      );
    }

    case "code": {
      const codeToken = token as Tokens.Code;
      const rawLang = codeToken.lang || "";
      const [lang, filename] = rawLang.split(":");

      return (
        <CodeBlock
          key={key}
          code={codeToken.text}
          language={lang || "text"}
          filename={filename}
        />
      );
    }

    case "blockquote": {
      const bqToken = token as Tokens.Blockquote;
      return (
        <blockquote
          key={key}
          className="my-6 p-4 rounded-xs backdrop-blur-md bg-[var(--accent-soft)]/40 dark:bg-[var(--accent-soft)]/20 border-l-2 border-[var(--accent)] border-y border-r border-black/[0.07] dark:border-white/[0.1] font-serif italic text-sm sm:text-base text-[var(--ink-primary)] leading-relaxed space-y-2"
        >
          {bqToken.tokens.map((subToken, subIdx) => (
            <BlockToken key={`bq-${subIdx}`} token={subToken} index={subIdx} />
          ))}
        </blockquote>
      );
    }

    case "hr":
      return (
        <div key={key} className="w-36 sm:w-56 mx-auto my-8">
          <InkLine />
        </div>
      );

    case "space":
      return null;

    default: {
      const container = token as { tokens?: Token[] };
      if (Array.isArray(container.tokens)) {
        return (
          <div key={key}>
            <InlineTokens tokens={container.tokens} />
          </div>
        );
      }
      return null;
    }
  }
}

export function MarkdownRenderer({
  content,
  className = "",
}: MarkdownRendererProps) {
  const tokens = useMemo(() => {
    return marked.lexer(content);
  }, [content]);

  return (
    <div
      className={`prose-editorial text-[var(--ink-primary)] font-serif ${className}`}
    >
      {tokens.map((token, index) => (
        <BlockToken key={`token-${index}`} token={token} index={index} />
      ))}
    </div>
  );
}
