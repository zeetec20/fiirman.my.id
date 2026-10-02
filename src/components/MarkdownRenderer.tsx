import { ExternalLink } from "lucide-react";
import { marked, type Token, type Tokens } from "marked";
import React, { useMemo } from "react";
import { CodeBlock } from "@/components/CodeBlock";
import { ImageFrame } from "@/components/ImageFrame";
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

function hashTokenSource(source: string): string {
  let hash = 0x811c9dc5;
  for (let position = 0; position < source.length; position += 1) {
    hash ^= source.charCodeAt(position);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function normalizeTokenSource(value: unknown, depth = 0): string {
  if (depth > 6) return "";
  if (Array.isArray(value)) {
    return `[${value.map((entry) => normalizeTokenSource(entry, depth + 1)).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const fields = Object.keys(record)
      .filter((field) => typeof record[field] !== "function")
      .sort()
      .map(
        (field) =>
          `${field}:${normalizeTokenSource(record[field], depth + 1)}`,
      );
    return `{${fields.join(",")}}`;
  }
  return JSON.stringify(value) ?? "";
}

function fingerprintToken(token: unknown): string {
  const record = token as { type?: unknown };
  return `${String(record?.type ?? "node")}-${hashTokenSource(normalizeTokenSource(token))}`;
}

interface KeyedToken<T> {
  token: T;
  key: string;
}

function keyedTokens<T>(
  tokens: readonly T[] | undefined,
  parentKey: string,
  fingerprint: (token: T) => string,
): KeyedToken<T>[] {
  if (!tokens) return [];
  const occurrences = new Map<string, number>();
  return tokens.map((token) => {
    const fingerprintValue = fingerprint(token);
    const duplicate = (occurrences.get(fingerprintValue) ?? 0) + 1;
    occurrences.set(fingerprintValue, duplicate);
    return {
      token,
      key:
        duplicate === 1
          ? `${parentKey}/${fingerprintValue}`
          : `${parentKey}/${fingerprintValue}#${duplicate}`,
    };
  });
}

/** Shared frame props for an inline markdown image. */
function imageFrameProps(imgToken: Tokens.Image) {
  const filename = imgToken.href.split("/").pop() || "image";
  return {
    src: imgToken.href,
    alt: imgToken.text,
    filename,
    badge: filename.split(".").pop()?.toUpperCase() || "IMAGE",
  };
}

/** The padded thumbnail stage shared by every rendered markdown image. */
function MarkdownImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="p-2 sm:p-4 flex items-center justify-center">
      <img
        src={src}
        alt={alt}
        className="rounded-xs max-w-full h-auto object-contain max-h-[75vh]"
      />
    </div>
  );
}

function InlineTokens({
  tokens,
  parentKey,
}: {
  tokens?: Token[];
  parentKey: string;
}) {
  if (!tokens || tokens.length === 0) return null;

  return (
    <>
      {keyedTokens(tokens, parentKey, fingerprintToken).map(({ token, key }) => {

        switch (token.type) {
          case "text":
            return (
              <React.Fragment key={key}>
                {(token as Tokens.Text).tokens ? (
                  <InlineTokens parentKey={key} tokens={(token as Tokens.Text).tokens} />
                ) : (
                  (token as Tokens.Text).text
                )}
              </React.Fragment>
            );

          case "strong":
            return (
              <strong key={key} className="font-bold text-[var(--ink-primary)]">
                <InlineTokens parentKey={key} tokens={(token as Tokens.Strong).tokens} />
              </strong>
            );

          case "em":
            return (
              <em key={key} className="italic">
                <InlineTokens parentKey={key} tokens={(token as Tokens.Em).tokens} />
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
                className="text-[var(--accent)] hover:text-[#b37a00] dark:hover:text-[#ffd27a] underline underline-offset-4 decoration-[var(--accent)]/50 hover:decoration-[var(--accent)] transition-colors font-medium inline-flex items-center gap-1 cursor-pointer"
              >
                <InlineTokens parentKey={key} tokens={linkToken.tokens} />
                {isExternal && (
                  <ExternalLink className="w-3 h-3 inline-block shrink-0 opacity-75" />
                )}
              </a>
            );
          }

          case "image": {
            const imgToken = token as Tokens.Image;
            return (
              <ImageFrame
                key={key}
                {...imageFrameProps(imgToken)}
                caption={imgToken.title || imgToken.text}
              >
                <MarkdownImage src={imgToken.href} alt={imgToken.text} />
              </ImageFrame>
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

/* ------------------------------------------------------------------ *
 * One component per block type.
 *
 * These branches used to be inline `case` arms inside `BlockToken`, which
 * pushed the function past the complexity threshold
 * (react-doctor/no-high-complexity-react-function). `BlockToken` below is now
 * only a dispatcher.
 * ------------------------------------------------------------------ */

function HeadingBlock({
  token,
  nodeKey,
}: {
  token: Tokens.Heading;
  nodeKey: string;
}) {
  const cleanTitle = token.text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`#]/g, "")
    .trim();
  const id = slugify(cleanTitle);

  if (token.depth === 1) {
    return (
      <h1
        id={id}
        className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[var(--ink-primary)] leading-tight mt-10 mb-6 scroll-mt-24"
      >
        <InlineTokens parentKey={nodeKey} tokens={token.tokens} />
      </h1>
    );
  }

  if (token.depth === 2) {
    return (
      <h2
        id={id}
        className="font-serif text-2xl sm:text-3xl font-bold text-[var(--ink-primary)] mt-10 mb-4 pt-4 border-t border-[var(--divider-subtle)] first:border-0 first:pt-0 scroll-mt-24"
      >
        <InlineTokens parentKey={nodeKey} tokens={token.tokens} />
      </h2>
    );
  }

  if (token.depth === 3) {
    return (
      <h3
        id={id}
        className="font-serif text-xl sm:text-2xl font-semibold text-[var(--ink-primary)] mt-8 mb-3 scroll-mt-24"
      >
        <InlineTokens parentKey={nodeKey} tokens={token.tokens} />
      </h3>
    );
  }

  return (
    <h4
      id={id}
      className="font-serif text-lg font-medium text-[var(--ink-primary)] mt-6 mb-2 scroll-mt-24"
    >
      <InlineTokens parentKey={nodeKey} tokens={token.tokens} />
    </h4>
  );
}

function ParagraphBlock({
  token,
  nodeKey,
}: {
  token: Tokens.Paragraph;
  nodeKey: string;
}) {
  const soleToken = token.tokens?.[0];

  // A paragraph holding nothing but an image renders as a bare frame.
  if (token.tokens && token.tokens.length === 1 && soleToken?.type === "image") {
    const imgToken = soleToken as Tokens.Image;
    return (
      <ImageFrame {...imageFrameProps(imgToken)}>
        <MarkdownImage src={imgToken.href} alt={imgToken.text} />
      </ImageFrame>
    );
  }

  return (
    <p className="my-5 text-base sm:text-lg font-serif text-[var(--ink-primary)] leading-[1.8]">
      <InlineTokens parentKey={nodeKey} tokens={token.tokens} />
    </p>
  );
}

function ListBlock({
  token,
  nodeKey,
}: {
  token: Tokens.List;
  nodeKey: string;
}) {
  const items = keyedTokens(token.items, nodeKey, fingerprintToken).map(
    ({ token: item, key }) => (
      <li key={key} className="pl-1 leading-relaxed">
        <InlineTokens parentKey={key} tokens={item.tokens} />
      </li>
    ),
  );

  if (token.ordered) {
    return (
      <ol className="my-5 space-y-2.5 pl-6 list-decimal marker:font-mono marker:text-[var(--accent)] marker:font-semibold text-base sm:text-lg text-[var(--ink-primary)] leading-relaxed">
        {items}
      </ol>
    );
  }

  return (
    <ul className="my-5 space-y-2.5 pl-6 list-disc marker:text-[var(--accent)] text-base sm:text-lg text-[var(--ink-primary)] leading-relaxed">
      {items}
    </ul>
  );
}

function CodeFenceBlock({ token }: { token: Tokens.Code }) {
  const [language, filename] = (token.lang || "").split(":");
  return (
    <CodeBlock
      code={token.text}
      language={language || "text"}
      filename={filename}
    />
  );
}

function BlockquoteBlock({
  token,
  nodeKey,
}: {
  token: Tokens.Blockquote;
  nodeKey: string;
}) {
  return (
    <blockquote className="my-6 p-4 rounded-xs backdrop-blur-md bg-[var(--accent-soft)]/40 dark:bg-[var(--accent-soft)]/20 border-l-2 border-[var(--accent)] border-y border-r border-black/[0.07] dark:border-white/[0.1] font-serif italic text-sm sm:text-base text-[var(--ink-primary)] leading-relaxed space-y-2">
      {keyedTokens(token.tokens, nodeKey, fingerprintToken).map(
        ({ token: subToken, key }) => (
          <BlockToken key={key} token={subToken} nodeKey={key} />
        ),
      )}
    </blockquote>
  );
}

function RuleBlock() {
  return (
    <div className="w-36 sm:w-56 mx-auto my-8">
      <InkLine />
    </div>
  );
}

function FallbackBlock({
  token,
  nodeKey,
}: {
  token: Token;
  nodeKey: string;
}) {
  const { tokens } = token as { tokens?: Token[] };
  if (!Array.isArray(tokens)) return null;
  return (
    <div>
      <InlineTokens parentKey={nodeKey} tokens={tokens} />
    </div>
  );
}

function BlockToken({
  token,
  nodeKey,
}: {
  token: Token;
  nodeKey: string;
}) {

  switch (token.type) {
    case "heading":
      return (
        <HeadingBlock
          key={nodeKey}
          token={token as Tokens.Heading}
          nodeKey={nodeKey}
        />
      );

    case "paragraph":
      return (
        <ParagraphBlock
          key={nodeKey}
          token={token as Tokens.Paragraph}
          nodeKey={nodeKey}
        />
      );

    case "list":
      return (
        <ListBlock key={nodeKey} token={token as Tokens.List} nodeKey={nodeKey} />
      );

    case "code":
      return <CodeFenceBlock key={nodeKey} token={token as Tokens.Code} />;

    case "blockquote":
      return (
        <BlockquoteBlock
          key={nodeKey}
          token={token as Tokens.Blockquote}
          nodeKey={nodeKey}
        />
      );

    case "hr":
      return <RuleBlock key={nodeKey} />;

    case "space":
      return null;

    default:
      return <FallbackBlock key={nodeKey} token={token} nodeKey={nodeKey} />;
  }
}

export function InlineMarkdown({
  content,
  className = "",
}: {
  content: string;
  className?: string;
}) {
  const tokens = useMemo(() => {
    const normalized = content.replace(/\u00A0/g, " ");
    const parsed = marked.lexer(normalized);
    const first = parsed[0];
    if (first && "tokens" in first && Array.isArray(first.tokens)) {
      return first.tokens;
    }
    return parsed;
  }, [content]);

  return (
    <span className={className}>
      <InlineTokens parentKey="inline-markdown" tokens={tokens} />
    </span>
  );
}

export function MarkdownRenderer({
  content,
  className = "",
}: MarkdownRendererProps) {
  const tokens = useMemo(() => {
    const normalized = content.replace(/\u00A0/g, " ");
    return marked.lexer(normalized);
  }, [content]);

  return (
    <div
      className={`prose-editorial text-[var(--ink-primary)] font-serif ${className}`}
    >
      {keyedTokens(tokens, "article", fingerprintToken).map(
        ({ token, key }) => (
          <BlockToken key={key} token={token} nodeKey={key} />
        ),
      )}
    </div>
  );
}
