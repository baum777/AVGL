import fs from "node:fs";
import path from "node:path";

const root = path.join(process.cwd(), "web", "assets");
const manifestPath = path.join(root, "manifest.json");

if (!fs.existsSync(manifestPath)) {
  throw new Error("Missing web/assets/manifest.json");
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const missing = [];

for (const file of manifest.files ?? []) {
  const target = path.join(root, file.path);
  if (!fs.existsSync(target)) missing.push(file.path);
}

const required = [
  "01_logos/svg/avgl-primary-horizontal.svg",
  "01_logos/svg/avgl-technical-lockup.svg",
  "02_favicon_appicons/favicon.svg",
  "02_favicon_appicons/favicon.ico",
  "02_favicon_appicons/avgl-app-icon-light-180.png",
  "02_favicon_appicons/site.webmanifest",
  "03_foundations/design-tokens.css",
  "04_iconography/core/avgl-flow.svg",
  "04_iconography/core/avgl-identity.svg",
  "04_iconography/lenses/avgl-agentic.svg",
  "04_iconography/lenses/avgl-evidence.svg",
  "04_iconography/lenses/avgl-structure.svg",
  "04_iconography/ui/avgl-analyze.svg",
  "04_iconography/ui/avgl-file.svg",
  "04_iconography/ui/avgl-folder.svg",
  "04_iconography/ui/avgl-relation.svg",
  "04_iconography/ui/avgl-workspace.svg",
  "05_ui_assets/empty_states/avgl-empty-no-file.svg",
  "05_ui_assets/empty_states/avgl-empty-no-evidence.svg",
  "05_ui_assets/patterns/avgl-grid-pattern.svg",
  "06_marketing/og/avgl-og-main.png"
];

for (const relative of required) {
  if (!fs.existsSync(path.join(root, relative)) && !missing.includes(relative)) {
    missing.push(relative);
  }
}

if (missing.length) {
  console.error("Missing AVGL web assets:");
  for (const file of missing) console.error(" - " + file);
  process.exit(1);
}

console.log("Verified " + (manifest.files?.length ?? 0) + " committed AVGL assets under web/assets.");
