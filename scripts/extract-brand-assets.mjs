import fs from "node:fs";
import path from "node:path";
import { parseEntries, extractEntry } from "../api/asset-extract.mjs";

const ZIP_NAME = "AVGL_FULL_ASSET_PACKAGE_LAYERED_PROJECTION.zip";
const SOURCE_PREFIX = "AVGL_FULL_ASSET_PACKAGE/";
const zipPath = path.join(process.cwd(), ZIP_NAME);
const targetRoot = path.join(process.cwd(), "web", "assets", "brand");

if (!fs.existsSync(zipPath)) {
  console.error(`Missing ${ZIP_NAME}`);
  process.exit(1);
}

const zip = fs.readFileSync(zipPath);
const entries = parseEntries(zip).filter((entry) =>
  !entry.name.endsWith("/") && entry.name.startsWith(SOURCE_PREFIX)
);

if (process.argv.includes("--list")) {
  for (const entry of entries) console.log(entry.name.slice(SOURCE_PREFIX.length));
  console.error(`${entries.length} bundled AVGL assets`);
  process.exit(0);
}

for (const entry of entries) {
  const relative = entry.name.slice(SOURCE_PREFIX.length);
  const outputPath = path.join(targetRoot, relative);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, extractEntry(zip, entry));
}

console.log(`Extracted ${entries.length} AVGL assets to ${path.relative(process.cwd(), targetRoot)}`);
