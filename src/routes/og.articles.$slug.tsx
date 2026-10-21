import { ImageResponse } from "@cf-wasm/og/workerd";
import { createFileRoute } from "@tanstack/react-router";
import { type Article, articlesData } from "@/data/articles";
import { ArticleOgImage } from "@/og/article-og-image";
import { ogFonts } from "@/og/og-image";

// shortcut: cached per isolate only; add Cache API or KV caching if the list grows far beyond the current archive.
const rendered = new Map<string, Promise<ArrayBuffer>>();

function toDataUrl(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  for (let index = 0; index < bytes.length; index += 0x2000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x2000));
  }

  return `data:image/png;base64,${btoa(binary)}`;
}

async function getCoverDataUrl(slug: string, requestUrl: string) {
  const response = await fetch(new URL(`/og-covers/${slug}.png`, requestUrl));
  if (!response.ok) return undefined;
  return toDataUrl(await response.arrayBuffer());
}

function renderArticleImage(article: Article, requestUrl: string) {
  const cached = rendered.get(article.slug);
  if (cached) return cached;

  const task = (async () => {
    const cover = await getCoverDataUrl(article.slug, requestUrl);
    const image = await ImageResponse.async(
      <ArticleOgImage article={article} cover={cover} />,
      {
        width: 1200,
        height: 630,
        fonts: ogFonts,
        format: "png",
      },
    );
    return image.arrayBuffer();
  })().catch((error) => {
    rendered.delete(article.slug);
    throw error;
  });

  rendered.set(article.slug, task);
  return task;
}

export const Route = createFileRoute("/og/articles/$slug")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const article = articlesData.find((item) => item.slug === params.slug);
        if (!article) {
          return new Response("Not found", { status: 404 });
        }

        return new Response(await renderArticleImage(article, request.url), {
          headers: {
            "Content-Type": "image/png",
            "Cache-Control":
              "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
          },
        });
      },
    },
  },
});
