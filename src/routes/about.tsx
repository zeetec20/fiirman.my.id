import { createFileRoute } from "@tanstack/react-router";
import { Fleuron } from "../components/fleuron";
import { GithubActivity } from "../components/github-activity";
import { Kicker } from "../components/kicker";
import { PortraitFrame } from "../components/portrait-frame";
import { RubricLink } from "../components/rubric-link";
import { RuleDouble, RuleHair } from "../components/rules";
import { Card, CardContent } from "../components/ui/card";
import { getAllArticles } from "../lib/articles";
import { getBioHtml } from "../lib/bio";

const AVATAR_URL = "https://avatars.githubusercontent.com/u/47957217?size=480";

/**
 * Spotify embed — currently a public classical playlist as placeholder.
 * Swap the track / playlist ID below to a personal favorite.
 *
 *   Track:    https://open.spotify.com/embed/track/<TRACK_ID>
 *   Playlist: https://open.spotify.com/embed/playlist/<PLAYLIST_ID>
 *   Album:    https://open.spotify.com/embed/album/<ALBUM_ID>
 */
const SPOTIFY_EMBED_URL =
	"https://open.spotify.com/embed/track/60LWmlDdZ2482qQziKsCjF?utm_source=generator&theme=0";
const SPOTIFY_LABEL = "From the author's desk";
const SPOTIFY_EMBED_HEIGHT = 152;

export const Route = createFileRoute("/about")({
	component: About,
	loader: () => ({
		articles: getAllArticles(),
		bioHtml: getBioHtml(),
	}),
});

function About() {
	const { bioHtml } = Route.useLoaderData();

	return (
		<section className="py-8">
			{/* Header — portrait + heading + dek */}
			<header className="grid md:grid-cols-12 gap-10 items-center mb-12">
				<div className="md:col-span-4 max-w-2xs sm:max-w-xs md:max-w-none mx-auto md:mx-0 w-full">
					<PortraitFrame
						accent="rubric"
						seal={{ text: "FIRMAN LESTARI · ZEETEC20", monogram: "FL" }}
					>
						<img
							src={AVATAR_URL}
							alt="Firman Lestari"
							width={400}
							height={400}
							loading="lazy"
							className="w-full aspect-square object-cover block thumbnail-engraved"
						/>
					</PortraitFrame>
					<p className="small-caps text-xs text-fg-muted mt-4 text-center tracking-wider">
						Firman Lestari · ZEETEC20 · Compositor of these pages
					</p>
				</div>
				<div className="md:col-span-8">
					<Kicker>The Author</Kicker>
					<h1 className="font-serif-display text-4xl md:text-5xl leading-tight mt-3">
						A short notice from the desk.
					</h1>
					<p className="font-serif-display italic text-fg-muted text-xl mt-4 leading-snug">
						Engineer by trade; reader by disposition. Keeps a column on
						Git, version control, and the quiet craft of moving bits
						without losing them.
					</p>
				</div>
			</header>

			<RuleDouble className="my-10" />

			{/* Bio body — sourced from content/bio.md */}
			<div
				className="prose-article has-drop-cap"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: trusted, pre-rendered SSR content
				dangerouslySetInnerHTML={{ __html: bioHtml }}
			/>

			<RuleDouble className="my-12" />

			{/* From the Phonograph — Spotify embed */}
			<section className="max-w-prose mx-auto">
				<div className="text-center mb-6">
					<div className="text-rubric flex justify-center mb-2">
						<Fleuron variant="flourish" />
					</div>
					<Kicker>From the Phonograph</Kicker>
					<h2 className="font-serif-display text-2xl mt-2">
						What plays while the desk is at work.
					</h2>
					<p className="small-caps text-xs text-fg-muted tracking-wider mt-3">
						Now spinning · {SPOTIFY_LABEL}
					</p>
				</div>
				<Card className="rounded-sm border-rule ring-0 bg-bg-aged/60 py-0 gap-0 overflow-hidden">
					<CardContent className="p-1">
						<iframe
							title={`Spotify · ${SPOTIFY_LABEL}`}
							src={SPOTIFY_EMBED_URL}
							width="100%"
							height={SPOTIFY_EMBED_HEIGHT}
							loading="lazy"
							allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
							className="block w-full border-0"
						/>
					</CardContent>
				</Card>
			</section>

			<RuleDouble className="my-12" />

			{/* A Year in Keystrokes — GitHub activity */}
			<header className="text-center mb-6">
				<Kicker>From the Ledger</Kicker>
				<h2 className="font-serif-display text-2xl mt-2">
					A year in keystrokes.
				</h2>
			</header>
			<GithubActivity className="max-w-page mx-auto px-2" />

			<RuleHair className="my-12 max-w-prose mx-auto" />

			{/* Closing CTA */}
			<div className="text-center pb-4">
				<p className="font-serif-display italic text-fg-muted text-lg mb-3">
					Correspondence is welcomed at the foot of any folio.
				</p>
				<RubricLink to="/articles" className="small-caps text-xs">
					Read the archive →
				</RubricLink>
			</div>
		</section>
	);
}
