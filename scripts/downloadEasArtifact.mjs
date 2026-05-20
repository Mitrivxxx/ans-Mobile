/**
 * Pobiera plik aplikacji (Android: APK/AAB, iOS: IPA) z URL z `eas build --json`.
 * Użycie: node scripts/downloadEasArtifact.mjs <eas-output.json> <android|ios>
 */
import fs from "fs";
import path from "path";

const [, , jsonPath, platform] = process.argv;

if (!jsonPath || !platform) {
  console.error(
    "Użycie: node scripts/downloadEasArtifact.mjs <eas-output.json> <android|ios>"
  );
  process.exit(1);
}

if (platform !== "android" && platform !== "ios") {
  console.error('platform musi być "android" lub "ios"');
  process.exit(1);
}

function findArtifactUrl(value) {
  if (!value || typeof value !== "object") return null;

  const artifacts = value.artifacts ?? value;
  return (
    artifacts.buildUrl ??
    artifacts.applicationArchiveUrl ??
    value.buildUrl ??
    value.applicationArchiveUrl ??
    null
  );
}

function normalizeBuilds(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object" && Array.isArray(raw.builds)) {
    return raw.builds;
  }
  return [raw];
}

/** Rozpoznanie rozszerzenia archiwum Android (.aab vs .apk) z URL lub metadanych builda. */
function androidArtifactExtension(artifactUrl, buildSlice) {
  try {
    const pathname = decodeURIComponent(new URL(artifactUrl).pathname);
    const lower = pathname.toLowerCase();
    if (lower.endsWith(".aab")) return "aab";
    if (lower.endsWith(".apk")) return "apk";
  } catch {
    /* ignoruj niepoprawny URL */
  }

  const hint =
    buildSlice && typeof buildSlice === "object"
      ? JSON.stringify(buildSlice)
      : "";
  if (/\.aab\b/i.test(hint)) return "aab";
  if (/\.apk\b/i.test(hint)) return "apk";

  return "aab";
}

const parsed = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const builds = normalizeBuilds(parsed);

let artifactUrl = null;
let buildForArtifact = null;
for (const build of builds) {
  artifactUrl = findArtifactUrl(build);
  if (artifactUrl) {
    buildForArtifact = build;
    break;
  }
}


if (!artifactUrl) {
  console.error("Brak URL artefaktu w pliku EAS JSON:");
  console.error(JSON.stringify(parsed, null, 2));
  process.exit(1);
}

const appConfig = JSON.parse(fs.readFileSync("app.json", "utf8"));
const version = appConfig.expo.version;
const ext =
  platform === "ios"
    ? "ipa"
    : androidArtifactExtension(artifactUrl, buildForArtifact ?? parsed);
const outDir = path.join("dist", "releases");
fs.mkdirSync(outDir, { recursive: true });
const outfile = path.join(outDir, `WDMobile-${version}-${platform}.${ext}`);

console.log(`Pobieranie: ${artifactUrl}`);
const response = await fetch(artifactUrl);
if (!response.ok) {
  throw new Error(`Pobieranie nie powiodło się: HTTP ${response.status}`);
}

const buffer = Buffer.from(await response.arrayBuffer());
fs.writeFileSync(outfile, buffer);
console.log(`Zapisano: ${outfile} (${buffer.length} bajtów)`);
