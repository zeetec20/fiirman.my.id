import { Link } from "@tanstack/react-router";
import { DitherImage } from "@/components/ui/dither-image";
import type { Article } from "@/data/articles";

interface ArticleCardProps {
  article: Article;
  variant?: "lead" | "compact" | "detailed";
  indexPrefix?: string;
  className?: string;
}

export function ArticleCard({
  article,
  variant = "detailed",
  indexPrefix,
  className = "",
}: ArticleCardProps) {
  if (variant === "lead") {
    return (
      <article
        className={`flex flex-col justify-between h-full group ${className}`}
      >
        <div>
          <div className="relative w-full aspect-[16/10] rounded-xs overflow-hidden shadow-smooth-lg bg-black/40">
            <DitherImage
              src={article.coverImage}
              alt={article.title}
              priority
              className="object-cover filter contrast-[1.08] brightness-[0.92]"
            />
          </div>

          {/* Folio Metadata */}
          <div className="font-mono text-[9px] sm:text-[10px] text-[var(--ink-muted)] tracking-[0.2em] uppercase mt-4 mb-1">
            {indexPrefix || "I"} {"//"} {article.date.toUpperCase()}
          </div>

          {/* Title */}
          <h2 className="font-serif text-xl sm:text-2xl font-bold leading-snug">
            <Link
              to="/articles/$slug"
              params={{ slug: article.slug }}
              className="text-[var(--ink-primary)] group-hover:text-[var(--accent)] transition-colors underline-offset-4 group-hover:underline"
            >
              {article.title}
            </Link>
          </h2>

          {/* Mini Description */}
          <p className="font-serif text-xs sm:text-sm text-[var(--ink-secondary)] leading-relaxed mt-2.5">
            {article.excerpt}
          </p>
        </div>

        {/* Bottom Tag & Read Action */}
        <div className="mt-5 pt-3 flex items-center justify-between font-mono text-[9px] text-[var(--ink-muted)] tracking-widest uppercase">
          <span>{article.tags.slice(0, 3).join(" // ").toUpperCase()}</span>
          <Link
            to="/articles/$slug"
            params={{ slug: article.slug }}
            className="text-[var(--accent)] hover:opacity-85 tracking-[0.18em] font-semibold transition-opacity flex items-center gap-1"
          >
            <span>READ FOLIO</span>
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article
        className={`group flex items-start sm:items-stretch gap-4 ${className}`}
      >
        <div className="relative w-28 sm:w-36 md:w-40 lg:w-48 h-24 sm:h-auto sm:self-stretch shrink-0 overflow-hidden rounded-xs bg-black/40 shadow-smooth-md group-hover:shadow-smooth-lg transition-shadow duration-300">
          <DitherImage
            src={article.coverImage}
            alt={article.title}
            className="object-cover filter contrast-[1.08] brightness-[0.92]"
            pixelSize={1}
          />
        </div>
        <div className="flex-1 flex flex-col justify-between py-0.5 overflow-hidden">
          <div>
            <div className="font-mono text-[9px] text-[var(--ink-muted)] tracking-widest uppercase">
              {indexPrefix ? `${indexPrefix} // ` : ""}
              {article.date.toUpperCase()}
            </div>
            <h3 className="font-serif text-sm sm:text-base font-bold leading-snug line-clamp-2 mt-0.5">
              <Link
                to="/articles/$slug"
                params={{ slug: article.slug }}
                className="text-[var(--ink-primary)] group-hover:text-[var(--accent)] hover:underline group-hover:underline underline-offset-4 transition-colors"
              >
                {article.title}
              </Link>
            </h3>
            <p className="font-serif text-xs text-[var(--ink-secondary)] leading-relaxed line-clamp-2 mt-1">
              {article.excerpt}
            </p>
          </div>
          <div className="font-mono text-[8px] sm:text-[9px] text-[var(--ink-muted)] tracking-widest uppercase truncate mt-2">
            {article.tags.slice(0, 3).join(" // ").toUpperCase()}
          </div>
        </div>
      </article>
    );
  }

  // Detailed (Archive feed)
  return (
    <article
      className={`group flex items-start sm:items-stretch gap-3.5 sm:gap-5 py-3 border-b border-[var(--divider-subtle)] last:border-b-0 ${className}`}
    >
      {/* Mini Thumbnail Image on the Left */}
      <div className="relative w-24 sm:w-36 h-24 sm:h-auto sm:self-stretch shrink-0 overflow-hidden rounded-xs bg-black/40 shadow-smooth-md group-hover:shadow-smooth-lg transition-shadow duration-300">
        <DitherImage
          src={article.coverImage}
          alt={article.title}
          className="object-cover filter contrast-[1.08] brightness-[0.92]"
          pixelSize={1}
        />
      </div>

      {/* Text Details on the Right */}
      <div className="flex-1 flex flex-col justify-between py-0.5 space-y-1.5 overflow-hidden">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-[9px] sm:text-[10px] text-[var(--ink-muted)] uppercase tracking-wider">
            <time>{article.date}</time>
            <span>{"//"}</span>
            <span>{article.readingTime}</span>
            <span>{"//"}</span>
            <span className="text-[var(--accent)] font-medium">
              #{article.tags[0]?.toUpperCase() || "MANUSCRIPT"}
            </span>
          </div>

          <h3 className="font-serif text-base sm:text-lg font-bold text-[var(--ink-primary)] leading-snug">
            <Link
              to="/articles/$slug"
              params={{ slug: article.slug }}
              className="group-hover:text-[var(--accent)] hover:underline group-hover:underline underline-offset-4 transition-colors"
            >
              {article.title}
            </Link>
          </h3>

          <p className="font-serif text-xs sm:text-sm text-[var(--ink-secondary)] leading-relaxed line-clamp-2">
            {article.excerpt}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-[8px] sm:text-[9px] text-[var(--ink-muted)] truncate">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="hover:text-[var(--accent)] transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
