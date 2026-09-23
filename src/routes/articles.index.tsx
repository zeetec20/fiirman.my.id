import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArticleCard } from "@/components/ArticleCard";
import { DocumentLayout } from "@/components/DocumentLayout";
import { SectionHeader } from "@/components/SectionHeader";
import { articlesData } from "@/data/articles";

export const Route = createFileRoute("/articles/")({
  component: ArticlesPage,
});

interface TagFilterDropdownProps {
  selectedTag: string;
  onSelectTag: (tag: string) => void;
  availableTags: string[];
  tagCounts: Record<string, number>;
  totalArticles: number;
}

function TagFilterDropdown({
  selectedTag,
  onSelectTag,
  availableTags,
  tagCounts,
  totalArticles,
}: TagFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      searchInputRef.current?.focus();
    } else {
      setSearchFilter("");
    }
  }, [isOpen]);

  const filteredTags = useMemo(() => {
    const query = searchFilter.toLowerCase().trim();
    if (!query) return availableTags;
    return availableTags.filter((tag) => tag.toLowerCase().includes(query));
  }, [availableTags, searchFilter]);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <div className="bg-black/5 dark:bg-white/5 border border-[var(--divider-subtle)] hover:border-[var(--accent)] text-[var(--ink-primary)] font-mono text-xs rounded-xs flex items-center focus-within:ring-1 focus-within:ring-[var(--accent)] transition-colors">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className="cursor-pointer select-none pl-2.5 pr-2 py-1.5 flex items-center gap-2 focus:outline-hidden text-left"
        >
          <span className="truncate max-w-[170px] sm:max-w-[220px]">
            {selectedTag === "All"
              ? `ALL TAGS (${totalArticles})`
              : `#${selectedTag} (${tagCounts[selectedTag] || 0})`}
          </span>
          {selectedTag === "All" && (
            <ChevronDown
              className={`w-3.5 h-3.5 text-[var(--ink-muted)] transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          )}
        </button>

        {selectedTag !== "All" && (
          <button
            type="button"
            onClick={() => onSelectTag("All")}
            title="Clear tag filter"
            aria-label="Clear tag filter"
            className="p-1 mr-1 text-[var(--ink-muted)] hover:text-[var(--accent)] transition-colors cursor-pointer focus:outline-hidden"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown Menu Panel */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-64 max-h-80 z-50 rounded-xs shadow-smooth-lg border border-black/10 dark:border-white/15 backdrop-blur-xl bg-white/70 dark:bg-stone-900/70 ring-1 ring-black/5 dark:ring-white/5 flex flex-col overflow-hidden animate-in fade-in duration-100">
          {/* Embedded Tag Search Input */}
          <div className="p-2 border-b border-[var(--divider-subtle)] flex items-center gap-1.5 bg-black/[0.03] dark:bg-white/[0.03]">
            <Search className="w-3.5 h-3.5 text-[var(--ink-muted)] shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search tags..."
              aria-label="Search tag list"
              className="w-full text-xs font-mono bg-transparent border-0 focus:outline-hidden text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)]"
            />
            {searchFilter && (
              <button
                type="button"
                onClick={() => setSearchFilter("")}
                aria-label="Clear tag search query"
                className="text-[var(--ink-muted)] hover:text-[var(--ink-primary)] cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Tags List */}
          <div className="overflow-y-auto max-h-60 py-1 font-mono text-xs">
            {/* 'ALL TAGS' Option */}
            <button
              type="button"
              onClick={() => {
                onSelectTag("All");
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-[var(--accent)]/10 transition-colors cursor-pointer ${
                selectedTag === "All"
                  ? "text-[var(--accent)] font-semibold bg-[var(--accent)]/10"
                  : "text-[var(--ink-primary)]"
              }`}
            >
              <span>ALL TAGS</span>
              <span className="text-[10px] text-[var(--ink-muted)]">
                ({totalArticles})
              </span>
            </button>

            {filteredTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  onSelectTag(tag);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-[var(--accent)]/10 transition-colors cursor-pointer ${
                  selectedTag === tag
                    ? "text-[var(--accent)] font-semibold bg-[var(--accent)]/10"
                    : "text-[var(--ink-primary)]"
                }`}
              >
                <span className="truncate pr-2">#{tag}</span>
                <span className="text-[10px] text-[var(--ink-muted)] shrink-0">
                  ({tagCounts[tag]})
                </span>
              </button>
            ))}

            {filteredTags.length === 0 && (
              <div className="px-3 py-4 text-center text-xs text-[var(--ink-muted)] font-serif italic">
                No matching tags
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ArticlesPage() {
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const article of articlesData) {
      for (const tag of article.tags) {
        counts[tag] = (counts[tag] || 0) + 1;
      }
    }
    return counts;
  }, []);

  const availableTags = useMemo(() => {
    return Object.keys(tagCounts).sort((a, b) => {
      const diff = tagCounts[b] - tagCounts[a];
      if (diff !== 0) return diff;
      return a.localeCompare(b);
    });
  }, [tagCounts]);

  const filteredArticles = articlesData.filter((article) => {
    const matchesTag =
      selectedTag === "All" || article.tags.includes(selectedTag);

    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some((t) =>
        t.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    return matchesTag && matchesSearch;
  });

  return (
    <DocumentLayout pageNumber="p. 02/04" documentTitle="WRITINGS ARCHIVE">
      <div className="space-y-8">
        {/* Reusable Section Header */}
        <SectionHeader
          title="Field Writings & Notes"
          dek="Thoughts, experiments, and things I have learned along the way."
        />

        {/* Tag Filter & Search Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-2 font-mono">
          {/* Custom Tag Selector Control */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--ink-muted)] tracking-wider uppercase font-medium">
              FILTER BY TAG:
            </span>
            <TagFilterDropdown
              selectedTag={selectedTag}
              onSelectTag={setSelectedTag}
              availableTags={availableTags}
              tagCounts={tagCounts}
              totalArticles={articlesData.length}
            />
          </div>

          {/* Minimal Clean Search */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search titles or tags..."
              aria-label="Search articles"
              className="w-full sm:w-56 text-xs font-mono bg-black/5 dark:bg-white/5 border border-[var(--divider-subtle)] px-2.5 py-1.5 rounded-xs focus:outline-hidden focus:ring-1 focus:ring-[var(--accent)] text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[var(--ink-muted)] hover:text-[var(--ink-primary)] cursor-pointer"
              >
                &times;
              </button>
            )}
          </div>
        </div>

        {/* Article List: Each item with reusable ArticleCard */}
        <div className="space-y-4 font-serif">
          {filteredArticles.length === 0 ? (
            <div className="py-8 text-center text-sm font-serif italic text-[var(--ink-muted)]">
              No writings match the selected criteria.
            </div>
          ) : (
            filteredArticles.map((article) => (
              <ArticleCard
                key={article.slug}
                article={article}
                variant="detailed"
              />
            ))
          )}
        </div>
      </div>
    </DocumentLayout>
  );
}
