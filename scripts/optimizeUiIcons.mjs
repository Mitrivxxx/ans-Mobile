/**
 * Optymalizuje PNG używane w UI (w miejscu + logo logowania z anslogo).
 * Wywoływane z generateAppIcons.mjs lub: node scripts/optimizeUiIcons.mjs
 */
import { stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const iconsDir = path.join(root, 'assets/icons');

export const PNG_OPTS = { compressionLevel: 9, effort: 10 };

/** @3× względem QUICK_ACTION_ICON_SIZE (40px) × imageScale 1.2 */
const QUICK_ACTION_MAX_PX = 144;

/** LOGIN_LOGO_SIZE 141 × @3 */
const LOGIN_LOGO_MAX_PX = 432;

/**
 * @type {Array<{ file: string, maxDimension?: number, compressOnly?: boolean }>}
 */
const UI_ASSETS = [
  { file: 'calendar.png', maxDimension: QUICK_ACTION_MAX_PX },
  { file: 'school.png', maxDimension: QUICK_ACTION_MAX_PX },
  { file: 'bell.png', maxDimension: QUICK_ACTION_MAX_PX },
  { file: 'logov2.png', compressOnly: true },
  { file: 'logov2_dark.png', compressOnly: true },
];

export async function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KiB`;
}

/**
 * @param {string} absPath
 * @param {{ maxDimension?: number, compressOnly?: boolean }} options
 */
export async function optimizePngInPlace(absPath, options = {}) {
  const { maxDimension, compressOnly = false } = options;
  const beforeStat = await stat(absPath);
  const beforeMeta = await sharp(absPath).metadata();

  let pipeline = sharp(absPath);
  let willResize = false;

  if (!compressOnly && maxDimension) {
    const longest = Math.max(beforeMeta.width ?? 0, beforeMeta.height ?? 0);
    if (longest > maxDimension) {
      willResize = true;
      pipeline = pipeline.resize(maxDimension, maxDimension, {
        fit: 'inside',
        withoutEnlargement: true,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      });
    }
  }

  const pngOpts = { ...PNG_OPTS };
  const small =
    (beforeMeta.width ?? 0) <= 128 && (beforeMeta.height ?? 0) <= 128;
  if (small && beforeMeta.hasAlpha) {
    pngOpts.palette = true;
    pngOpts.quality = 90;
  }

  const buffer = await pipeline.png(pngOpts).toBuffer();
  const afterMeta = await sharp(buffer).metadata();

  const dimensionChanged =
    afterMeta.width !== beforeMeta.width ||
    afterMeta.height !== beforeMeta.height;
  const smaller = buffer.length < beforeStat.size;

  if (!willResize && !dimensionChanged && !smaller) {
    return {
      rel: path.relative(root, absPath),
      before: beforeStat.size,
      after: beforeStat.size,
      dims: `${beforeMeta.width}×${beforeMeta.height}`,
      skipped: true,
    };
  }

  await writeFile(absPath, buffer);
  return {
    rel: path.relative(root, absPath),
    before: beforeStat.size,
    after: buffer.length,
    dims: `${afterMeta.width}×${afterMeta.height}`,
    skipped: false,
  };
}

/** Lżejsze logo na ekranie logowania — źródło anslogo.png. */
export async function writeLoginLogo() {
  const target = path.join(iconsDir, 'anslogo.png');
  const optimized = await optimizePngInPlace(target, {
    maxDimension: LOGIN_LOGO_MAX_PX,
  });
  const { size } = await stat(target);
  return {
    rel: optimized.rel,
    size,
    dims: optimized.dims,
  };
}

export async function runOptimizeUiIcons() {
  const results = [];

  for (const { file, maxDimension, compressOnly } of UI_ASSETS) {
    results.push(
      await optimizePngInPlace(path.join(iconsDir, file), {
        maxDimension,
        compressOnly,
      })
    );
  }

  const loginLogo = await writeLoginLogo();
  return { results, loginLogo };
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  console.log('Optymalizacja ikon UI…');
  const { results, loginLogo } = await runOptimizeUiIcons();
  for (const r of results) {
    const note = r.skipped ? 'bez zmian' : `${await formatBytes(r.before)} → ${await formatBytes(r.after)}`;
    console.log(`  ${r.rel} (${r.dims}) ${note}`);
  }
  console.log(
    `  ${loginLogo.rel} (${loginLogo.dims}, ${await formatBytes(loginLogo.size)})`
  );
}
