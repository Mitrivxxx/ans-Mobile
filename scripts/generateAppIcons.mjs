/**
 * Generates Expo launcher icons from assets/icons/logo_mobile.png.
 * Run: npm run generate-icons
 * Then rebuild the native app (prebuild / EAS) — icons are baked at build time.
 */
import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const source = path.join(root, 'assets/icons/logo_mobile.png');

const targets = [
  path.join(root, 'assets/icon.png'),
  path.join(root, 'assets/adaptive-icon.png'),
];

await mkdir(path.dirname(targets[0]), { recursive: true });

for (const target of targets) {
  await copyFile(source, target);
  console.log(`Wrote ${path.relative(root, target)}`);
}

console.log('Done. Rebuild the app (npm run prebuild:android or EAS build) to apply launcher icons.');
