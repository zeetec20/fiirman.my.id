import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArticleCard } from "../components/article-card";
import { ArticleThumbnail } from "../components/article-thumbnail";
import { Byline } from "../components/byline";
import { Dateline, toRoman } from "../components/dateline";
import { Dek } from "../components/dek";
import { Fleuron } from "../components/fleuron";
import { Kicker } from "../components/kicker";
import { RubricLink } from "../components/rubric-link";
import { RuleHair } from "../components/rules";
import type { Article } from "../lib/article-schema";
import { getAllArticles } from "../lib/articles";
import { getAnalytics } from "../lib/track-analytic";

export const Route = createFileRoute("/")({
	component: Home,
	loader: () => ({ articles: getAllArticles() }),
});

function todayKey(): string {
	const d = new Date();
	const dd = String(d.getDate()).padStart(2, "0");
	const mm = String(d.getMonth() + 1).padStart(2, "0");
	const yyyy = d.getFullYear();
	return `${dd}-${mm}-${yyyy}`;
}

function Home() {
	const { articles } = Route.useLoaderData();
	const today = todayKey();
	const [featured, ...rest] = articles;

	/* Popularity overlay — fetch view counts from Supabase, sort articles
	   desc by count. Falls back to newest-first ordering when analytics is
	   unconfigured, errors, or returns empty (new install, all-zero state). */
	const [popular, setPopular] = useState<Article[]>(() =>
		articles.slice(0, Math.min(5, articles.length)),
	);

	const allPaths = useMemo(
		() => articles.map((a) => `/articles/${a.slug}`),
		[articles],
	);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			const counts = await getAnalytics(allPaths);
			if (cancelled || counts.size === 0) return;
			const ranked = [...articles].sort((a, b) => {
				const ac = counts.get(`/articles/${a.slug}`) ?? 0;
				const bc = counts.get(`/articles/${b.slug}`) ?? 0;
				if (bc !== ac) return bc - ac;
				/* tie-break: preserve newest-first via existing array order */
				return articles.indexOf(a) - articles.indexOf(b);
			});
			/* Always fill 5 slots — articles with counter=0 fall to the bottom
			   of the sorted list but still surface as "popular" placeholders. */
			setPopular(ranked.slice(0, Math.min(5, ranked.length)));
		})();
		return () => {
			cancelled = true;
		};
	}, [articles, allPaths]);

	/* Top Stories slicing — unchanged. */
	let cursor = 0;
	const topStoriesCount = Math.min(3, rest.length - cursor);
	const topStories = rest.slice(cursor, cursor + topStoriesCount);
	cursor += topStoriesCount;
	/* Others — up to 2 articles after Featured + Top Stories. Merged with the
	   "see the full archive" CTA into a single section. */
	const others = rest.slice(cursor, cursor + 2);
	const showArchiveCta = articles.length > 1;

	if (!featured) {
		return (
			<section className="text-center py-20">
				<Kicker>FROM THE DESK</Kicker>
				<p className="font-serif text-lg mt-4">
					No articles yet. Run the one-shot GitHub import, then refresh.
				</p>
			</section>
		);
	}

	const featuredTag = featured.tag.slice(0, 3).join(" · ").toUpperCase();
	const [leadStory, ...sideStories] = topStories;

	return (
		<>
			{/* Epigraph — the paper's standing motto for this edition */}
			<section className="pt-4 pb-8">
				<RuleHair className="max-w-prose mx-auto" />
				<blockquote className="max-w-prose mx-auto px-6 py-6 text-center">
					<p className="font-serif-display italic text-xl sm:text-2xl leading-snug text-fg">
						“We can only see a short distance ahead, but we can see plenty
						there that needs to be done.”
					</p>
					<cite className="small-caps text-xs text-fg-muted not-italic block mt-3 tracking-wider">
						Alan M. Turing &middot; Computing Machinery and Intelligence
						&middot; MCML
					</cite>
				</blockquote>
				<RuleHair className="max-w-prose mx-auto" />
			</section>

			{/* Hero feature + Of Note rail */}
			<section className="pt-2 pb-10 grid md:grid-cols-12 gap-x-8 gap-y-6 items-start">
				<div className="md:col-span-8 md:border-r md:border-rule md:pr-8">
					<div className="mb-5">
						<ArticleThumbnail
							src={featured.thumbnail}
							alt={featured.title}
						/>
					</div>
					{featuredTag ? <Kicker>{featuredTag}</Kicker> : null}
					<h2 className="font-serif-display leading-[1.05] mt-3 text-3xl md:text-4xl lg:text-5xl">
						<RubricLink
							to="/articles/$slug"
							params={{ slug: featured.slug }}
							className="text-fg border-none hover:text-rubric"
						>
							{featured.title}
						</RubricLink>
					</h2>
					<div className="has-drop-cap mt-5">
						<Dek>{featured.description}</Dek>
					</div>
					<Byline
						className="mt-5"
						writer={featured.writer}
						date={featured.createdAt}
					/>
					<div className="mt-4">
						<RubricLink
							to="/articles/$slug"
							params={{ slug: featured.slug }}
							className="small-caps text-xs"
						>
							Continue reading &rarr;
						</RubricLink>
					</div>
				</div>

				{/* Popular Articles — right rail (Supabase-ranked, falls back to newest) */}
				{popular.length > 0 ? (
					<aside className="md:col-span-4">
						<div className="mb-2 text-rubric flex justify-center">
							<Fleuron variant="flourish" />
						</div>
						<div className="small-caps text-xs text-fg-muted tracking-[0.2em] mb-4 text-center">
							Popular Articles
						</div>
						<ul className="flex flex-col">
							{popular.map((a, i) => (
								<li
									key={a.slug}
									className={
										i === 0
											? "pb-4"
											: "py-4 border-t border-rule"
									}
								>
									<div className="flex items-baseline gap-2 small-caps text-xs text-fg-muted tracking-wider mb-1">
										<span
											aria-label={`Item ${i + 1}`}
											className="font-serif-display not-italic text-rubric text-sm tracking-normal"
										>
											·{toRoman(i + 1)}·
										</span>
										<span aria-hidden="true">·</span>
										<Dateline date={a.createdAt} />
									</div>
									<h3 className="font-serif-display text-lg leading-snug">
										<RubricLink
											to="/articles/$slug"
											params={{ slug: a.slug }}
											className="text-fg border-none hover:text-rubric"
										>
											{a.title}
										</RubricLink>
									</h3>
									<div className="mt-1">
										<Kicker>
											{a.tag.slice(0, 2).join(" · ").toUpperCase() ||
												"ESSAY"}
										</Kicker>
									</div>
								</li>
							))}
						</ul>
					</aside>
				) : null}
			</section>

			{/* Dateline ribbon */}
			<div className="my-8">
				<RuleHair />
				<div className="py-3 text-center small-caps text-xs text-fg-muted tracking-wider">
					Edition &middot; <Dateline date={today} /> &middot; Firman Lestari
				</div>
				<RuleHair />
			</div>

			{/* Latest stories — asymmetric: one lead + two stacked */}
			{leadStory ? (
				<section>
					<div className="text-center mb-8">
						<div className="mb-2 text-rubric flex justify-center">
							<Fleuron variant="flourish" />
						</div>
						<Kicker>Latest Stories</Kicker>
					</div>
					<div className="grid gap-x-10 gap-y-10 md:grid-cols-12">
						<div className="md:col-span-7 md:border-r md:border-rule md:pr-10">
							<ArticleCard article={leadStory} />
						</div>
						<div className="md:col-span-5 flex flex-col">
							{sideStories.map((a, i) => (
								<div
									key={a.slug}
									className={
										i === 0
											? "pb-6"
											: "pt-6 border-t border-rule"
									}
								>
									<ArticleCard article={a} showThumbnail={false} />
								</div>
							))}
						</div>
					</div>
				</section>
			) : null}

			{/* Other Articles — up to 2 items + inline archive CTA */}
			{others.length > 0 || showArchiveCta ? (
				<section className="mt-16">
					<div className="text-center mb-8">
						<div className="mb-2 text-rubric flex justify-center">
							<Fleuron variant="flourish" />
						</div>
						<Kicker>Other Articles</Kicker>
					</div>
						{others.length > 0 ? (
							<ul
								className={
									others.length === 2
										? "grid gap-x-10 md:grid-cols-2"
										: "max-w-prose mx-auto"
								}
							>
								{others.map((a, i) => (
									<li
										key={a.slug}
										className={
											i === 0 && others.length === 2
												? "py-4 md:border-r md:border-rule md:pr-10"
												: "py-4"
										}
									>
										<Kicker>
											{a.tag.slice(0, 2).join(" · ").toUpperCase() ||
												"ESSAY"}
										</Kicker>
										<h3 className="font-serif-display text-2xl leading-tight mt-1">
											<RubricLink
												to="/articles/$slug"
												params={{ slug: a.slug }}
												className="text-fg border-none hover:text-rubric"
											>
												{a.title}
											</RubricLink>
										</h3>
										<Byline
											className="mt-2"
											writer={a.writer}
											date={a.createdAt}
										/>
									</li>
								))}
							</ul>
						) : null}
					{showArchiveCta ? (
						<div className="text-center mt-8">
							<RubricLink to="/articles" className="small-caps text-xs">
								See the full archive →
							</RubricLink>
						</div>
					) : null}
				</section>
			) : null}
		</>
	);
}
