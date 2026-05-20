/**
 * Generuje ikony launchera + optymalizuje PNG UI w assets/icons/.
 *
 * Launcher (z logo_mobile.png):
 * - assets/icon.png — 1024×1024, tło #000
 * - assets/adaptive-icon.png — foreground, safe zone ~66%
 *
 * UI: calendar / school / bell, logov2, logo_login.png
 *
 * Uruchom: npm run generate-icons
 */
import { mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import {
  formatBytes,
  runOptimizeUiIcons,
} from './optimizeUiIcons.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const source = path.join(root, 'assets/icons/logo_mobile.png');

const SIZE = 1024;
/** Safe zone adaptive icon (Google: środkowe ~66% kwadratu). */
const ADAPTIVE_SAFE_PX = Math.round(SIZE * 0.66);

/** Zgodne z expo.android.adaptiveIcon.backgroundColor w app.json */
const LAUNCHER_BG = { r: 0, g: 0, b: 0, alpha: 1 };

const pngOptions = { compressionLevel: 9, effort: 10 };

const outputs = {
  icon: path.join(root, 'assets/icon.png'),
  adaptive: path.join(root, 'assets/adaptive-icon.png'),
};

async function fileSizeLabel(filePath) {
  const { size } = await stat(filePath);
  return formatBytes(size);
}

/** Ikona główna: skala do 1024, jednolite tło pod przezroczystością. */
async function writeExpoIcon() {
  await sharp(source)
    .resize(SIZE, SIZE, { fit: 'contain', background: LAUNCHER_BG })
    .png(pngOptions)
    .toFile(outputs.icon);
}

/** Foreground adaptive: logo w safe zone, reszta przezroczysta (tło z app.json). */
async function writeAdaptiveForeground() {
  const { data, info } = await sharp(source)
    .resize(ADAPTIVE_SAFE_PX, ADAPTIVE_SAFE_PX, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer({ resolveWithObject: true });

  const left = Math.round((SIZE - info.width) / 2);
  const top = Math.round((SIZE - info.height) / 2);

  await sharp({
    create: {
      width: SIZE,
      height: SIZE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: data, left, top }])
    .png(pngOptions)
    .toFile(outputs.adaptive);
}

await mkdir(path.dirname(outputs.icon), { recursive: true });

const meta = await sharp(source).metadata();
console.log(
  `Źródło: ${path.relative(root, source)} (${meta.width}×${meta.height}, ${meta.format})`
);

await writeExpoIcon();
await writeAdaptiveForeground();

for (const [label, filePath] of [
  ['icon', outputs.icon],
  ['adaptive-icon', outputs.adaptive],
]) {
  console.log(`  ${label}: ${path.relative(root, filePath)} (${await fileSizeLabel(filePath)})`);
}

console.log('\nIkony UI (dashboard, nagłówek, logowanie):');
const { results, loginLogo } = await runOptimizeUiIcons();
for (const r of results) {
  const note = r.skipped
    ? 'skompresowane / bez zmian rozmiaru pliku'
    : `${await formatBytes(r.before)} → ${await formatBytes(r.after)}`;
  console.log(`  ${r.rel} (${r.dims}) ${note}`);
}
console.log(
  `  ${loginLogo.rel} (${loginLogo.dims}, ${await formatBytes(loginLogo.size)})`
);

console.log('\nGotowe. Przebuduj natywnie (prebuild lub EAS build), jeśli zmieniły się ikony launchera.');
