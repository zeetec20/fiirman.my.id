import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import articlesManifest from "../src/data/articles-manifest.json";

// Same 8x8 Bayer matrix and palette as src/components/ui/dither-image.tsx.
const BAYER_8X8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

const DARK = [10, 9, 8];
const AMBER = [255, 185, 48];
const CREAM = [237, 231, 220];

const WIDTH = 1200;
const HEIGHT = 630;
const PIXEL_SIZE = 2;
const SAMPLE_WIDTH = WIDTH / PIXEL_SIZE;
const SAMPLE_HEIGHT = HEIGHT / PIXEL_SIZE;

const outputDir = join(process.cwd(), "public", "og-covers");
mkdirSync(outputDir, { recursive: true });

let generated = 0;

for (const article of articlesManifest) {
  const articleDir = join(process.cwd(), "public", "article", article.slug);
  const source = ["thumbnail.jpg", "thumbnail.webp"]
    .map((name) => join(articleDir, name))
    .find((path) => existsSync(path));

  if (!source) {
    console.warn(`skip ${article.slug}: no thumbnail`);
    continue;
  }

  const { data } = await sharp(source)
    .resize(SAMPLE_WIDTH, SAMPLE_HEIGHT, { fit: "cover", position: "centre" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const output = Buffer.alloc(WIDTH * HEIGHT * 3);

  for (let y = 0; y < SAMPLE_HEIGHT; y++) {
    for (let x = 0; x < SAMPLE_WIDTH; x++) {
      const index = (y * SAMPLE_WIDTH + x) * 3;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];

      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      const bayer = BAYER_8X8[y % 8][x % 8] / 64 - 0.5;
      const thresholded = luminance + bayer * 0.38;

      const color =
        thresholded < 0.28 ? DARK : thresholded < 0.65 ? AMBER : CREAM;

      for (let dy = 0; dy < PIXEL_SIZE; dy++) {
        for (let dx = 0; dx < PIXEL_SIZE; dx++) {
          const outIndex =
            ((y * PIXEL_SIZE + dy) * WIDTH + x * PIXEL_SIZE + dx) * 3;
          output[outIndex] = color[0];
          output[outIndex + 1] = color[1];
          output[outIndex + 2] = color[2];
        }
      }
    }
  }

  await sharp(output, {
    raw: { width: WIDTH, height: HEIGHT, channels: 3 },
  })
    .png({ palette: true, colors: 3, effort: 10, dither: 0 })
    .toFile(join(outputDir, `${article.slug}.png`));

  generated++;
}

console.log(`generated ${generated} OG covers in public/og-covers`);
