import { createFileRoute } from "@tanstack/react-router";
import { ArticleCard } from "../components/article-card";
import { ArticleThumbnail } from "../components/article-thumbnail";
import { Byline } from "../components/byline";
import { Dateline } from "../components/dateline";
import { Dek } from "../components/dek";
import { Fleuron } from "../components/fleuron";
import { Kicker } from "../components/kicker";
import { RubricLink } from "../components/rubric-link";
import { RuleDouble, RuleHair } from "../components/rules";
import { getAllArticles } from "../lib/articles";

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

	/* Adaptive slicing — fill in priority order so sparse archives don't
	   render empty section headers. Order: top stories first (visual heft),
	   then Of Note rail, then long-tail Archive teaser. */
	let cursor = 0;
	const topStoriesCount = Math.min(3, rest.length - cursor);
	const topStories = rest.slice(cursor, cursor + topStoriesCount);
	cursor += topStoriesCount;
	const ofNoteCount = Math.min(4, rest.length - cursor);
	const ofNote = rest.slice(cursor, cursor + ofNoteCount);
	cursor += ofNoteCount;
	const archiveTeaser = rest.slice(cursor, cursor + 6);
	const hasMoreArchive = rest.length > cursor + archiveTeaser.length;
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

				{/* Of Note — right rail */}
				{ofNote.length > 0 ? (
					<aside className="md:col-span-4">
						<div className="mb-2 text-rubric flex justify-center">
							<Fleuron variant="flourish" />
						</div>
						<div className="small-caps text-xs text-fg-muted tracking-[0.2em] mb-4 text-center">
							Of Note
						</div>
						<ul className="flex flex-col">
							{ofNote.map((a, i) => (
								<li
									key={a.slug}
									className={
										i === 0
											? "pb-4"
											: "py-4 border-t border-rule"
									}
								>
									<Kicker>
										{a.tag.slice(0, 2).join(" · ").toUpperCase() ||
											"ESSAY"}
									</Kicker>
									<h3 className="font-serif-display text-lg leading-snug mt-1">
										<RubricLink
											to="/articles/$slug"
											params={{ slug: a.slug }}
											className="text-fg border-none hover:text-rubric"
										>
											{a.title}
										</RubricLink>
									</h3>
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

			{/* Top stories — asymmetric: one lead + two stacked */}
			{leadStory ? (
				<section>
					<div className="text-center mb-8">
						<Kicker>Top Stories</Kicker>
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

			{archiveTeaser.length > 0 ? (
				<>
					<RuleDouble className="my-12" />
					<section>
						<div className="text-center mb-6">
							<Kicker>From the Archive</Kicker>
						</div>
						<ul className="grid gap-x-10 md:grid-cols-2">
							{archiveTeaser.map((a) => (
								<li
									key={a.slug}
									className="py-4 border-b border-rule last:border-b-0"
								>
									<Kicker>
										{a.tag.slice(0, 2).join(" · ").toUpperCase() || "ESSAY"}
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
					</section>
				</>
			) : null}

			{showArchiveCta ? (
				archiveTeaser.length > 0 ? (
					<>
						<RuleDouble className="my-12" />
						<div className="text-center pb-6">
							<RubricLink to="/articles" className="small-caps text-xs">
								See the full archive →
							</RubricLink>
						</div>
					</>
				) : (
					<div className="text-center mt-6 pb-2">
						<RubricLink to="/articles" className="small-caps text-xs">
							{hasMoreArchive
								? "See the full archive →"
								: "Browse the archive →"}
						</RubricLink>
					</div>
				)
			) : null}
		</>
	);
}
