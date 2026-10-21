import { ImageResponse } from "@cf-wasm/og/workerd";
import { createFileRoute } from "@tanstack/react-router";
import { OgImage, ogFonts } from "@/og/og-image";

// shortcut: cached per isolate only; add Cache API or KV caching if cold renders get expensive.
let rendered: Promise<ArrayBuffer> | undefined;

function renderImage() {
  rendered ??= ImageResponse.async(<OgImage />, {
    width: 1200,
    height: 630,
    fonts: ogFonts,
    format: "png",
  })
    .then((response) => response.arrayBuffer())
    .catch((error) => {
      rendered = undefined;
      throw error;
    });

  return rendered;
}

export const Route = createFileRoute("/og.png")({
  server: {
    handlers: {
      GET: async () => {
        return new Response(await renderImage(), {
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
