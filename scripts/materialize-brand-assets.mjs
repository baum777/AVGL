import fs from "node:fs";
import path from "node:path";
import { parseEntries, extractEntry } from "../api/asset-extract.mjs";

const zipPath = path.join(process.cwd(), "AVGL_FULL_ASSET_PACKAGE_LAYERED_PROJECTION.zip");
const targetRoot = path.join(process.cwd(), "web", "assets", "brand");
const prefix = "AVGL_FULL_ASSET_PACKAGE/";
const zip = fs.readFileSync(zipPath);
const entries = parseEntries(zip).filter(entry => !entry.name.endsWith("/") && entry.name.startsWith(prefix));

if (process.argv.includes("--list")) {
  for (const entry of entries) console.log(entry.name.slice(prefix.length));
  console.error(entries.length + " bundled AVGL assets");
  process.exit(0);
}

fs.rmSync(targetRoot, { recursive: true, force: true });
fs.mkdirSync(targetRoot, { recursive: true });

for (const entry of entries) {
  const relative = entry.name.slice(prefix.length);
  const outputPath = path.join(targetRoot, relative);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, extractEntry(zip, entry));
}

console.log("Extracted " + entries.length + " AVGL assets to web/assets/brand");
