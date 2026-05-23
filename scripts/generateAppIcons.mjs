/**
 * Generuje ikony launchera + optymalizuje PNG UI w assets/icons/.
 *
 * Launcher (z logo_mobile.png):
 * - assets/icon.png — 1024×1024, tło #000
 * - assets/adaptive-icon.png — foreground, safe zone ~66%
 *
 * UI: calendar / school / bell, logov2, logov2_dark, anslogo.png (logowanie)
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

/**
 * Android adaptive foreground — ten sam artwork co icon.png (pełne 1024×1024).
 * Wcześniejsze skalowanie do ~66% safe zone dawało inną ikonę na pulpicie niż logo_mobile.
 */
async function writeAdaptiveForeground() {
  await sharp(source)
    .resize(SIZE, SIZE, { fit: 'contain', background: LAUNCHER_BG })
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

console.log('\nLogo nagłówka (ciemny motyw — białe napisy):');
await import('./generateLogoHeaderDark.mjs');

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
