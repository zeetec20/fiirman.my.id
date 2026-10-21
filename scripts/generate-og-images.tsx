import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { CustomFont, ImageResponse } from "@cf-wasm/og/node";
import type { ReactNode } from "react";
import sharp from "sharp";
import type { Article } from "../src/data/articles";
import articlesManifest from "../src/data/articles-manifest.json";
import { ArticleOgImage } from "../src/og/article-og-image";
import { type OgAssets, OgImage } from "../src/og/og-image";

const publicDir = join(process.cwd(), "public");
const assetDir = join(process.cwd(), "src", "og", "assets");
const fontDir = join(process.cwd(), "src", "og", "fonts");

function dataUri(path: string) {
  return `data:image/png;base64,${readFileSync(path).toString("base64")}`;
}

function font(name: string) {
  return readFileSync(join(fontDir, name));
}

const fonts = [
  new CustomFont("Inter", font("inter-400.bin"), { weight: 400 }),
  new CustomFont("Inter", font("inter-600.bin"), { weight: 600 }),
  new CustomFont("Inter", font("inter-800.bin"), { weight: 800 }),
  new CustomFont("UnifrakturMaguntia", font("unifraktur-400.bin"), {
    weight: 400,
  }),
  new CustomFont("Space Mono", font("space-mono-400.bin"), { weight: 400 }),
];

const assets: OgAssets = {
  cloudIcon: dataUri(join(assetDir, "cloud.png")),
  codeIcon: dataUri(join(assetDir, "code.png")),
  databaseIcon: dataUri(join(assetDir, "database.png")),
  grain: dataUri(join(assetDir, "grain.png")),
  settingsIcon: dataUri(join(assetDir, "settings.png")),
};

async function render(element: ReactNode, outputPath: string) {
  const image = await ImageResponse.async(element, {
    width: 1200,
    height: 630,
    fonts,
    format: "png",
  });

  const png = Buffer.from(await image.arrayBuffer());
  const compressed = await sharp(png)
    .png({
      palette: true,
      quality: 95,
      compressionLevel: 9,
      effort: 10,
      dither: 1,
    })
    .toBuffer();

  if (compressed.length > 300 * 1024) {
    console.warn(
      `OG image over 300 KB: ${outputPath} (${Math.round(compressed.length / 1024)} KB)`,
    );
  }

  writeFileSync(outputPath, compressed);
}

const articles = articlesManifest as Article[];
const articleOutputDir = join(publicDir, "og", "articles");
mkdirSync(articleOutputDir, { recursive: true });

// Satori has no backdrop-filter, so the card's frosted glass is a pre-blurred cover.
async function blurredCoverDataUri(path: string) {
  const png = await sharp(readFileSync(path)).blur(18).png().toBuffer();

  return `data:image/png;base64,${png.toString("base64")}`;
}

await render(<OgImage assets={assets} />, join(publicDir, "og.png"));

for (const article of articles) {
  const coverPath = join(publicDir, "og-covers", `${article.slug}.png`);
  const hasCover = existsSync(coverPath);
  const cover = hasCover ? dataUri(coverPath) : undefined;
  const coverBlur = hasCover ? await blurredCoverDataUri(coverPath) : undefined;

  await render(
    <ArticleOgImage
      article={article}
      cover={cover}
      coverBlur={coverBlur}
      grain={assets.grain}
    />,
    join(articleOutputDir, `${article.slug}.png`),
  );
}

console.log(`generated ${articles.length + 1} OG images in public/og`);
