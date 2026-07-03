import { Link } from "@tanstack/react-router";
import type { ArticleMeta } from "../lib/article-schema";
import { ArticleThumbnail } from "./article-thumbnail";
import { Byline } from "./byline";
import { Kicker } from "./kicker";
import { RuleHair } from "./rules";

/**
 * Card forms a single hover group (`group/card`). Classical-newspaper
 * hover treatment:
 *   - title gains an ink-stroke underline that draws in left → right
 *   - kicker (small-caps tag) warms from muted ink → rubric
 *   - thumbnail's own interactive treatment (scale + saturation lift)
 *   - hairline divider beneath shifts from rule → rubric tint
 * All transitions respect `prefers-reduced-motion`.
 */
export function ArticleCard({
	article,
	showThumbnail = true,
	priority = false,
}: {
	article: ArticleMeta;
	showThumbnail?: boolean;
	priority?: boolean;
}) {
	const tagLine = article.tag.slice(0, 3).join(" · ").toUpperCase();
	return (
		<article className="group/card flex flex-col gap-3">
			{showThumbnail ? (
				<Link
					to="/articles/$slug"
					params={{ slug: article.slug }}
					className="block no-underline"
				>
					<ArticleThumbnail
						src={article.thumbnail}
						alt={article.title}
						interactive
						aspect="feature"
						priority={priority}
					/>
				</Link>
			) : null}
			{tagLine ? (
				<Kicker className="transition-colors duration-300 ease-out group-hover/card:text-rubric group-focus-within/card:text-rubric">
					{tagLine}
				</Kicker>
			) : null}
			<h3 className="font-serif-display text-2xl leading-tight">
				<Link
					to="/articles/$slug"
					params={{ slug: article.slug }}
					className="ink-stroke text-fg no-underline outline-none focus-visible:text-rubric"
				>
					{article.title}
				</Link>
			</h3>
			<p className="text-fg-muted font-serif text-base">
				{article.description}
			</p>
			<Byline writer={article.writer} date={article.createdAt} />
			<RuleHair className="transition-colors duration-300 ease-out group-hover/card:border-rubric/40 group-focus-within/card:border-rubric/40" />
		</article>
	);
}
