import { ExternalLink, FileCode, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { CodeBlock } from "@/components/CodeBlock";
import preloadedGistsCache from "@/data/gists-cache.json";

export interface GistFileRecord {
  filename: string;
  language: string;
  content: string;
}

export interface GistDataRecord {
  id: string;
  description: string;
  owner: string;
  htmlUrl: string;
  files: GistFileRecord[];
}

interface GistEmbedProps {
  url: string;
}

const parseGitHubGistUrlIdentifier = (url: string): string => {
  const cleanUrl = url.trim().replace(/\/+$/, "");
  const parts = cleanUrl.split("/");
  return parts.pop() || "";
};

const gistsCacheMap = preloadedGistsCache as Record<string, GistDataRecord>;

export const GistEmbed = ({ url }: GistEmbedProps) => {
  const gistId = parseGitHubGistUrlIdentifier(url);
  const initialData = gistId ? gistsCacheMap[gistId] : undefined;

  const [data, setData] = useState<GistDataRecord | undefined>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(
    !initialData && Boolean(gistId),
  );
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    if (data || !gistId) return;

    let isSubscribed = true;
    setIsLoading(true);
    setHasError(false);

    const fetchGistData = async () => {
      try {
        const response = await fetch(`https://api.github.com/gists/${gistId}`, {
          headers: { Accept: "application/vnd.github.v3+json" },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const rawData = await response.json();
        const rawFiles = (rawData.files || {}) as Record<
          string,
          { filename: string; language?: string; content?: string }
        >;

        const files: GistFileRecord[] = Object.values(rawFiles).map((file) => ({
          filename: file.filename,
          language: (file.language || "text").toLowerCase(),
          content: file.content || "",
        }));

        if (isSubscribed) {
          setData({
            id: rawData.id,
            description: rawData.description || "",
            owner: rawData.owner?.login || "",
            htmlUrl: rawData.html_url || url,
            files,
          });
          setIsLoading(false);
        }
      } catch {
        if (isSubscribed) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    };

    fetchGistData();

    return () => {
      isSubscribed = false;
    };
  }, [gistId, data, url]);

  if (isLoading) {
    return (
      <div className="my-6 p-6 rounded-xs backdrop-blur-md bg-white/20 dark:bg-white/[0.04] border border-black/[0.07] dark:border-white/[0.1] flex items-center justify-center gap-2 text-xs font-mono text-[var(--ink-secondary)]">
        <Loader2 className="w-4 h-4 animate-spin opacity-70" />
        <span>Loading embedded Gist...</span>
      </div>
    );
  }

  if (hasError || !data || data.files.length === 0) {
    return (
      <div className="my-6 p-4 rounded-xs backdrop-blur-md bg-white/25 dark:bg-white/[0.04] border border-black/[0.07] dark:border-white/[0.1] flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <FileCode className="w-4 h-4 shrink-0 text-[var(--accent)]" />
          <span className="font-mono text-xs text-[var(--ink-primary)] truncate">
            {url}
          </span>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-xs font-mono font-medium text-[var(--accent)] hover:underline inline-flex items-center gap-1"
        >
          <span>View on GitHub</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    );
  }

  return (
    <div className="my-6 space-y-4">
      {data.files.map((file) => (
        <div key={`${data.id}-${file.filename}`}>
          <CodeBlock
            code={file.content}
            filename={file.filename}
            language={file.language}
          />
        </div>
      ))}
      <div className="flex justify-end px-1 -mt-2">
        <a
          href={data.htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-mono text-[var(--ink-secondary)] hover:text-[var(--accent)] transition-colors inline-flex items-center gap-1.5"
        >
          <span>View Gist on GitHub</span>
          <ExternalLink className="w-3 h-3 opacity-75" />
        </a>
      </div>
    </div>
  );
};
