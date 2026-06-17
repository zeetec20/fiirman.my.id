import { createFileRoute } from "@tanstack/react-router";
import { ArticleCard } from "../components/article-card";
import { Kicker } from "../components/kicker";
import { RuleDouble } from "../components/rules";
import { parseFrontmatterDate } from "../lib/article-schema";
import { getAllArticles } from "../lib/articles";

const SITE_URL = "https://fiirman.my.id";
const PAGE_TITLE = "Folios — Firman Lestari";
const PAGE_DESCRIPTION =
	"The complete archive: every article, grouped by year.";

export const Route = createFileRoute("/articles/")({
	component: ArchiveIndex,
	loader: () => ({ articles: getAllArticles() }),
	head: () => ({
		meta: [
			{ title: PAGE_TITLE },
			{ name: "description", content: PAGE_DESCRIPTION },
			{ property: "og:title", content: PAGE_TITLE },
			{ property: "og:description", content: PAGE_DESCRIPTION },
			{ property: "og:url", content: `${SITE_URL}/articles` },
		],
		links: [{ rel: "canonical", href: `${SITE_URL}/articles` }],
	}),
});

function ArchiveIndex() {
	const { articles } = Route.useLoaderData();

	const byYear = new Map<number, typeof articles>();
	for (const article of articles) {
		const year = parseFrontmatterDate(article.createdAt).getUTCFullYear();
		if (!byYear.has(year)) byYear.set(year, []);
		byYear.get(year)?.push(article);
	}

	const years = Array.from(byYear.keys()).sort((a, b) => b - a);

	return (
		<section className="py-8">
			<div className="text-center mb-8">
				<Kicker>ARCHIVE</Kicker>
				<h1 className="font-serif-display text-4xl mt-2">
					Every article, every year.
				</h1>
			</div>

			{years.map((year, yearIdx) => (
				<div key={year} className="mb-12">
					<div className="text-center mb-6">
						<RuleDouble className="mb-4" />
						<h2 className="font-serif-display italic text-2xl text-rubric leading-none">
							{year}
						</h2>
					</div>
					<div className="grid gap-y-10 md:grid-cols-2 xl:grid-cols-3 md:gap-x-8 md:divide-x md:divide-rule">
						{(byYear.get(year) ?? []).map((article, idx) => (
							<div
								key={article.slug}
								className="md:px-6 first:md:pl-0 last:md:pr-0"
							>
								{/* First article in most-recent year is LCP candidate. */}
								<ArticleCard
									article={article}
									priority={yearIdx === 0 && idx === 0}
								/>
							</div>
						))}
					</div>
				</div>
			))}

			{articles.length === 0 ? (
				<p className="text-center font-serif text-lg text-fg-muted">
					Archive is empty. Import articles first.
				</p>
			) : null}
		</section>
	);
}
