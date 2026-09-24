import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArticleScrollbar } from "@/components/ArticleScrollbar";
import { DocumentLayout } from "@/components/DocumentLayout";
import {
  InlineMarkdown,
  MarkdownRenderer,
} from "@/components/MarkdownRenderer";
import { ScanStamp } from "@/components/ScanStamp";
import { DitherImage } from "@/components/ui/dither-image";
import { InkLine } from "@/components/ui/ink";
import { getArticleBySlug } from "@/data/articles";

export const Route = createFileRoute("/articles/$slug")({
  loader: async ({ params }) => {
    const article = await getArticleBySlug(params.slug);
    if (!article) {
      throw notFound();
    }
    return { article };
  },
  head: ({ loaderData }) => {
    if (!loaderData?.article) {
      return { meta: [{ title: "Article Not Found" }] };
    }
    const { article } = loaderData;
    return {
      meta: [
        { title: `${article.title} // Firman Lestari` },
        { name: "description", content: article.excerpt },
        { property: "og:title", content: article.title },
        { property: "og:description", content: article.excerpt },
      ],
    };
  },
  component: ArticleDetailPage,
});

function ArticleDetailPage() {
  const { article } = Route.useLoaderData();

  const scrollbarSections = [
    { id: "manuscript-header", title: article.title },
    ...article.headings.map((h) => ({
      id: h.id,
      title: h.title,
    })),
  ];

  return (
    <DocumentLayout pageNumber="p. 02/04" documentTitle="MANUSCRIPT READER">
      <ArticleScrollbar sections={scrollbarSections} />
      <article className="space-y-8 max-w-2xl mx-auto font-serif">
        {/* Back Link */}
        <div>
          <Link
            to="/articles"
            className="font-serif italic text-sm text-[var(--ink-secondary)] hover:text-[var(--accent)] transition-colors inline-flex items-center gap-1"
          >
            <span>&larr; Back to writings archive</span>
          </Link>
        </div>

        {/* Lead Hero Banner Image — Persistent Archival Dither (No Hover Reveal) */}
        {article.coverImage && (
          <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-xs overflow-hidden shadow-smooth-lg bg-black/40">
            <DitherImage
              src={article.coverImage}
              alt={article.title}
              priority
              hoverReveal={false}
              pixelSize={1}
              className="object-cover filter contrast-[1.08] brightness-[0.92]"
            />
          </div>
        )}

        {/* Header Information */}
        <header id="manuscript-header" className="space-y-4 pb-2 scroll-mt-24">
          <div className="flex items-center justify-between gap-2 font-mono text-xs text-[var(--ink-muted)]">
            <div className="flex items-center gap-2">
              <time>{article.date}</time>
              <span>&bull;</span>
              <span>{article.readingTime}</span>
              <span className="hidden sm:inline">&bull;</span>
              <span className="hidden sm:inline text-[var(--accent)] font-semibold uppercase">
                {article.tags[0] ? `#${article.tags[0]}` : "MANUSCRIPT"}
              </span>
            </div>
            <ScanStamp label={article.docId} />
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[var(--ink-primary)] leading-tight">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono text-[var(--ink-muted)]">
            {article.tags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        </header>

        {/* Lead / Abstract */}
        {article.lead && (
          <div className="text-base sm:text-lg italic font-serif text-[var(--ink-primary)] pl-4 pr-3 py-2 leading-relaxed backdrop-blur-md bg-white/25 dark:bg-white/[0.04] rounded-xs border-l-2 border-[var(--accent)] border-y border-r border-black/[0.07] dark:border-white/[0.1]">
            <InlineMarkdown content={article.lead} />
          </div>
        )}

        {/* Manuscript Markdown Content */}
        <MarkdownRenderer content={article.content} />

        {/* Colophon Signoff */}
        <div className="pt-8 flex flex-col gap-4">
          <div className="w-36 sm:w-56 mx-auto">
            <InkLine />
          </div>
          <div className="flex items-center justify-between text-xs font-mono text-[var(--ink-muted)]">
            <span>Manuscript record complete</span>
            <Link
              to="/articles"
              className="text-[var(--accent)] hover:underline underline-offset-4 transition-colors"
            >
              &larr; Return to writings
            </Link>
          </div>
        </div>
      </article>
    </DocumentLayout>
  );
}
