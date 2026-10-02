import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Maximize2 } from "lucide-react";
import { useState } from "react";
import { DocumentLayout } from "@/components/DocumentLayout";
import { Lightbox } from "@/components/Lightbox";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { SectionHeader } from "@/components/SectionHeader";
import { DitherImage } from "@/components/ui/dither-image";
import { InkLine } from "@/components/ui/ink";
import { type Project, projectsData } from "@/data/projects";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Project Showcase // Firman Lestari" },
      {
        name: "description",
        content:
          "Biography, technical competencies, and GitHub activity ledger of Firman Lestari.",
      },
    ],
  }),
  component: ProjectsPage,
});

function GithubIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
    </svg>
  );
}

function ProjectsPage() {
const [maximizedProject, setMaximizedProject] = useState<Project | null>(
    null,
  );

  return (
    <DocumentLayout pageNumber="p. 03/04" documentTitle="PROJECT REGISTRY">
      <div className="space-y-8 font-serif">
        {/* Reusable Section Header */}
        <SectionHeader
          title="Project Showcase"
          dek="Things I have built, explored, and experimented with."
        />

        {/* Projects List / Showcase Cards */}
        <div className="space-y-12">
          {projectsData.map((proj, idx) => (
            <div key={proj.id}>
              <article className="group grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start py-2">
                {/* Left Column: Dithered Visual Artifact & Tech Specs */}
                <div className="md:col-span-5 flex flex-col gap-3">
                  {/* Visual Artifact with Click-to-Maximize */}
                  <button
                    type="button"
                    aria-label={`Maximize image for ${proj.title}`}
                    onClick={() => setMaximizedProject(proj)}
                    className="group/img text-left relative w-full aspect-[16/10] rounded-xs overflow-hidden bg-black/40 shadow-smooth-lg border border-stone-300/40 dark:border-stone-800/60 transition-colors duration-300 cursor-zoom-in hover:border-[var(--accent)]/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  >
                    <DitherImage
                      src={proj.image}
                      alt={proj.imageAlt}
                      className="object-cover filter contrast-[1.08] brightness-[0.92] transition-transform duration-500 group-hover/img:scale-105"
                      pixelSize={1}
                      hoverReveal={true}
                    />
                    {/* Maximize Badge Overlay */}
                    <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-xs backdrop-blur-md bg-white/25 dark:bg-white/[0.06] border border-black/[0.07] dark:border-white/[0.1] text-[var(--ink-primary)] shadow-smooth-sm opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <Maximize2 className="w-3 h-3 text-[var(--accent)]" />
                      <span className="font-mono text-[9px] font-semibold uppercase tracking-wider hidden sm:inline">
                        Maximize
                      </span>
                    </div>
                  </button>

                  {/* Tech Stack Pills */}
                  <div>
                    <div className="font-mono text-[9px] text-[var(--ink-muted)] uppercase tracking-wider mb-1.5">
                      TECHNOLOGY STACK
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {proj.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="font-mono text-[10px] tracking-wide px-2 py-0.5 rounded-xs bg-black/5 dark:bg-white/5 border border-stone-300/60 dark:border-stone-700/50 text-[var(--ink-secondary)]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Architectural Dossier, Description & Direct Actions */}
                <div className="md:col-span-7 flex flex-col justify-between h-full">
                  <div>
                    {/* Top Metadata Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] tracking-widest uppercase">
                      <span className="text-[var(--ink-muted)]">
                        {proj.year}
                      </span>
                      <span className="px-1.5 py-0.5 rounded-xs bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30 font-semibold text-[9px]">
                        {proj.badge}
                      </span>
                    </div>

                    {/* Project Title */}
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-[var(--ink-primary)] leading-tight mt-1.5">
                      {proj.title}
                    </h3>

                    {/* Markdown Description */}
                    <div className="mt-2.5">
                      <MarkdownRenderer
                        content={proj.content || proj.summary}
                        className="[&_p]:my-2 [&_p]:text-sm sm:[&_p]:text-base [&_p]:leading-relaxed [&_p]:text-[var(--ink-secondary)] [&_a]:text-[var(--accent)] [&_a]:underline [&_code]:text-xs [&_ul]:my-2 [&_ol]:my-2 [&_blockquote]:my-3 [&_blockquote]:p-3"
                      />
                    </div>
                  </div>

                  {/* Bottom Row: Direct Action Links */}
                  <div className="mt-5 pt-3 border-t border-stone-300/40 dark:border-stone-800/50 flex flex-wrap items-center justify-end gap-3 font-mono">
                    <div className="flex items-center gap-2.5">
                      {proj.links.demo && (
                        <a
                          href={proj.links.demo}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xs bg-[var(--accent)] text-[var(--accent-foreground)] font-bold text-[10px] sm:text-[11px] tracking-wider hover:opacity-90 transition-opacity shadow-xs"
                        >
                          <span>LIVE DEPLOYMENT</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {proj.links.repo && (
                        <a
                          href={proj.links.repo}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xs border border-stone-300 dark:border-stone-700 hover:border-[var(--accent)] text-[var(--ink-primary)] hover:text-[var(--accent)] font-semibold text-[10px] sm:text-[11px] tracking-wider transition-colors bg-black/2 dark:bg-white/2"
                        >
                          <GithubIcon className="w-3 h-3" />
                          <span>REPOSITORY</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </article>

              {/* Organic Handwritten Ink Divider between items */}
              {idx < projectsData.length - 1 && (
                <div className="w-full my-8 sm:my-10">
                  <InkLine />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Image Maximize Modal Overlay */}
      <Lightbox
        open={maximizedProject !== null}
        onClose={() => setMaximizedProject(null)}
        label={`Maximized view of ${maximizedProject?.title ?? ""}`}
        backdropClassName="backdrop:bg-black/20 dark:backdrop:bg-black/40 backdrop:backdrop-blur-xs"
        header={
          <span className="text-[10px] sm:text-[11px] font-medium text-[var(--ink-secondary)] uppercase tracking-wider truncate">
            {maximizedProject?.code} // {maximizedProject?.title}
          </span>
        }
      >
        {/* High-Resolution Maximized Image (Cover fit, larger viewport) */}
        <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[82vh] overflow-hidden bg-black/5 dark:bg-black/20">
          {maximizedProject && (
            <img
              src={maximizedProject.image}
              alt={maximizedProject.imageAlt}
              className="w-full h-full object-cover"
            />
          )}
        </div>
      </Lightbox>
    </DocumentLayout>
  );
}
