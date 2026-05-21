/**
 * Wariant logov2.png z białymi napisami (czytelne na ciemnym tle aplikacji).
 * Monogram ANS (złoto) bez zmian.
 *
 * Uruchom: node scripts/generateLogoHeaderDark.mjs
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const source = path.join(root, 'assets/icons/logov2.png');
const target = path.join(root, 'assets/icons/logov2_dark.png');

const PNG_OPTS = { compressionLevel: 9, effort: 10 };

/** Złoty monogram — nie zmieniać koloru. */
function isGoldPixel(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max ? (max - min) / max : 0;
  return r > 140 && g > 100 && b < 120 && sat > 0.25;
}

/** Ciemne napisy po prawej — zamiana na biały. */
function isDarkTextPixel(r, g, b, a) {
  if (a < 20) return false;
  if (isGoldPixel(r, g, b)) return false;
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max ? (max - min) / max : 0;
  return luma < 95 && sat < 0.4;
}

const { data, info } = await sharp(source)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
const out = Buffer.from(data);

for (let i = 0; i < out.length; i += channels) {
  const r = out[i];
  const g = out[i + 1];
  const b = out[i + 2];
  const a = out[i + 3];
  if (!isDarkTextPixel(r, g, b, a)) continue;
  out[i] = 255;
  out[i + 1] = 255;
  out[i + 2] = 255;
}

await sharp(out, { raw: { width, height, channels } })
  .png(PNG_OPTS)
  .toFile(target);

console.log(`Zapisano ${path.relative(root, target)} (${width}×${height})`);
