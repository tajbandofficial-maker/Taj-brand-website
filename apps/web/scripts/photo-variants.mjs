// Pre-builds resized WebP copies of the bundled photos (public/photos → public/photos-opt)
// so production never resizes them on request. Shared hosting (Hostinger) has little CPU,
// and on-demand optimisation made every first view of each size slow.
// Widths/quality live in src/lib/images/photo-variants.json, which the image loader also reads.
import { mkdirSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const web = join(dirname(fileURLToPath(import.meta.url)), "..");
const config = JSON.parse(
  readFileSync(join(web, "src", "lib", "images", "photo-variants.json"), "utf8"),
);
const sourceRoot = join(web, "public", config.sourceDir);
const outputRoot = join(web, "public", config.outputDir);
const pattern = /\.(jpe?g|png|webp)$/i;

function listPhotos(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return listPhotos(path);
    return pattern.test(entry.name) ? [path] : [];
  });
}

const mtime = (path) => {
  try {
    return statSync(path).mtimeMs;
  } catch {
    return -1;
  }
};

const started = Date.now();
let written = 0;
let skipped = 0;
for (const source of listPhotos(sourceRoot)) {
  const base = relative(sourceRoot, source).replace(/\\/g, "/").replace(pattern, "");
  const sourceTime = mtime(source);
  const { width: originalWidth = 0 } = await sharp(source).metadata();
  for (const width of config.widths) {
    const target = join(outputRoot, `${base}-${width}.webp`);
    if (mtime(target) >= sourceTime) {
      skipped++;
      continue;
    }
    mkdirSync(dirname(target), { recursive: true });
    await sharp(source)
      .rotate()
      .resize({ width: Math.min(width, originalWidth || width), withoutEnlargement: true })
      .webp({ quality: config.quality })
      .toFile(target);
    written++;
  }
}
const seconds = ((Date.now() - started) / 1000).toFixed(1);
console.log(`✓ Photo variants: ${written} written, ${skipped} up to date (${seconds}s).`);
