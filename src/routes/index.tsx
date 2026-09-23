import { createFileRoute } from "@tanstack/react-router";
import { ArticleCard } from "@/components/ArticleCard";
import { DocumentLayout } from "@/components/DocumentLayout";
import { InkLine } from "@/components/ui/ink";
import { articlesData } from "@/data/articles";
import { randomQuote } from "@/data/quotes";

export const Route = createFileRoute("/")({
  loader: () => ({
    quote: randomQuote(),
  }),
  component: Home,
});

function Home() {
  const { quote } = Route.useLoaderData();
  const leadArticle = articlesData[0];
  const newestArticles = articlesData.slice(1, 4);

  return (
    <DocumentLayout>
      <div className="relative">
        {/* Centered Quotation Section with a single impactful handwritten ink line */}
        <section
          className="relative my-4 sm:my-8 text-center"
          aria-label="Editorial Quotation"
        >
          <blockquote className="px-4 max-w-2xl mx-auto">
            <p className="font-serif italic text-lg sm:text-xl md:text-2xl text-[var(--ink-primary)] leading-relaxed">
              &ldquo;{quote.text}&rdquo;
            </p>
            <cite className="block font-mono text-[10px] sm:text-[11px] text-[var(--ink-muted)] tracking-[0.25em] uppercase mt-3 not-italic">
              {quote.author.toUpperCase()}
              {quote.source ? ` // ${quote.source.toUpperCase()}` : ""}
            </cite>
          </blockquote>

          {/* Single impactful imperfect ink stroke beneath citation */}
          <div className="w-36 sm:w-56 mx-auto mt-5">
            <InkLine />
          </div>
        </section>

        {/* Two-Column Split Layout: Exactly 4 Articles Aligned Flush */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 items-stretch mt-8 sm:mt-12">
          {/* Left Column: Article 1 - The Biggest UI Frontispiece */}
          {leadArticle && (
            <div className="md:col-span-6 flex flex-col justify-between h-full">
              <ArticleCard article={leadArticle} variant="lead" />
            </div>
          )}

          {/* Right Column: Follow 3 Articles (Articles 2, 3, 4) */}
          <section
            className="md:col-span-6 flex flex-col justify-between h-full"
            aria-label="Newest Articles"
          >
            {/* Section Heading: Clean typography without icons/flourishes */}
            <h2 className="font-serif text-xs text-[var(--ink-muted)] tracking-[0.25em] uppercase font-medium mb-3 text-center md:text-left">
              NEWEST ARTICLES
            </h2>

            {/* 3 Articles with mini image on the left, identical item height */}
            <div className="flex-1 flex flex-col justify-between py-1 gap-4">
              {newestArticles.map((article, idx) => (
                <ArticleCard
                  key={article.slug}
                  article={article}
                  variant="compact"
                  indexPrefix={["II", "III", "IV"][idx]}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </DocumentLayout>
  );
}
