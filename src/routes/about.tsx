import { createFileRoute } from "@tanstack/react-router";
import { AuthorPortrait } from "@/components/AuthorPortrait";
import { DocumentLayout } from "@/components/DocumentLayout";
import { GitHubActivityBar } from "@/components/GitHubActivityBar";
import { InkLine } from "@/components/ui/ink";
import { bioData } from "@/data/bio";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About the Author // Firman Lestari" },
      {
        name: "description",
        content:
          "Biography, technical competencies, and GitHub activity ledger of Firman Lestari.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <DocumentLayout pageNumber="p. 04/04" documentTitle="ABOUT THE AUTHOR">
      <div className="space-y-8 font-serif">
        {/* Section 1: Portrait & Narrative Header */}
        <section className="space-y-6" aria-label="Author Biography">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left: Author Portrait with Bayer Dither Canvas and Hover Reveal */}
            <div className="md:col-span-4 flex justify-center md:justify-start">
              <AuthorPortrait />
            </div>

            {/* Right: Author Heading & Editorial Dek */}
            <div className="md:col-span-8 space-y-3 text-center md:text-left">
              <div className="font-mono text-[10px] text-[var(--accent)] uppercase tracking-widest font-semibold">
                THE COMPOSITOR &amp; ENGINEER
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[var(--ink-primary)] leading-tight">
                A short notice from the desk.
              </h1>
              <p className="font-serif italic text-sm sm:text-base text-[var(--ink-secondary)] leading-relaxed">
                {bioData.dek}
              </p>
            </div>
          </div>

          {/* Full Narrative Essay */}
          <div className="space-y-4 text-sm sm:text-base text-[var(--ink-secondary)] leading-relaxed pt-2">
            <p className="text-[var(--ink-primary)]">
              {bioData.narrative.intro}
            </p>
            <p>{bioData.narrative.background}</p>
            <p>{bioData.narrative.philosophy}</p>
          </div>

          {/* Quick Technical Metadata */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 font-mono text-[10px] text-[var(--ink-muted)] uppercase tracking-wider border-t border-[var(--divider-subtle)]">
            <div>
              <span className="text-[var(--accent)] font-medium">
                LOCATION:{" "}
              </span>
              <span>{bioData.location}</span>
            </div>
            <div>
              <span className="text-[var(--accent)] font-medium">HANDLE: </span>
              <span>ZEETEC20</span>
            </div>
            <div>
              <span className="text-[var(--accent)] font-medium">FOCUS: </span>
              <span>FULL-STACK // DISTRIBUTED SYSTEMS</span>
            </div>
          </div>
        </section>

        {/* Handwritten Ink Line Divider */}
        <div className="w-36 sm:w-56 mx-auto py-2">
          <InkLine />
        </div>

        {/* Section 2: From the Phonograph — Spotify Player */}
        <section
          className="space-y-4 max-w-xl mx-auto text-center"
          aria-label="Audio player"
        >
          <div>
            <div className="font-mono text-[10px] text-[var(--accent)] uppercase tracking-widest font-semibold">
              FROM THE PHONOGRAPH
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[var(--ink-primary)] mt-1">
              What plays while the desk is at work.
            </h3>
            <p className="font-mono text-[9px] sm:text-[10px] text-[var(--ink-muted)] tracking-wider uppercase mt-1">
              NOW SPINNING · FROM THE AUTHOR&#39;S DESK
            </p>
          </div>
          <div className="rounded-xs overflow-hidden border border-black/10 dark:border-white/10 shadow-smooth-md">
            <iframe
              title="Spotify · From the author's desk"
              src="https://open.spotify.com/embed/track/60LWmlDdZ2482qQziKsCjF?utm_source=generator&theme=0"
              width="100%"
              height="152"
              loading="lazy"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-presentation"
              className="block w-full border-0"
            />
          </div>
        </section>

        {/* Handwritten Ink Line Divider */}
        <div className="w-36 sm:w-56 mx-auto py-2">
          <InkLine />
        </div>

        {/* Section 3: Technical Skills Used */}
        <section className="space-y-6" aria-label="Technical Skills Used">
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[var(--ink-primary)]">
              Technical Competencies &amp; Stack
            </h3>
            <p className="font-serif italic text-xs sm:text-sm text-[var(--ink-secondary)] mt-0.5">
              Production primitives, engineering languages, and infrastructure
              environments.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-serif">
            {bioData.competencies.map((cat) => (
              <div
                key={cat.title}
                className="space-y-3.5 p-4 rounded-xs backdrop-blur-md bg-white/25 dark:bg-white/[0.04] border border-black/[0.07] dark:border-white/[0.1]"
              >
                <div className="font-mono text-[10px] text-[var(--accent)] uppercase tracking-widest font-semibold">
                  {cat.classification}
                  {" // "}
                  {cat.title}
                </div>
                <ul className="space-y-2.5 text-xs sm:text-sm text-[var(--ink-secondary)]">
                  {cat.skills.map((s) => (
                    <li key={s.name} className="flex flex-col">
                      <span className="font-medium text-[var(--ink-primary)]">
                        {s.name}
                      </span>
                      <span className="font-mono text-[9px] sm:text-[10px] text-[var(--ink-muted)]">
                        {s.note || s.level}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Handwritten Ink Line Divider */}
        <div className="w-36 sm:w-56 mx-auto py-2">
          <InkLine />
        </div>

        {/* Section 4: GitHub Activity Bar */}
        <GitHubActivityBar />
      </div>
    </DocumentLayout>
  );
}
