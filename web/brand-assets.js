const ASSET_ROOT = "AVGL_FULL_ASSET_PACKAGE/";
const STATIC_ROOT = "/assets/brand/";

function normalizeAssetPath(path) {
  return String(path || "").replace(ASSET_ROOT, "").replace(/^\/+/, "");
}

function assetUrl(path) {
  return STATIC_ROOT + normalizeAssetPath(path).split("/").map(encodeURIComponent).join("/");
}

function humanFolder(path) {
  const parts = normalizeAssetPath(path).split("/");
  if (parts.length < 2) return "Package";
  return parts.slice(0, -1).join(" / ").replace(/^\d+_/, "").replaceAll("_", " ");
}

function ext(path) {
  const m = String(path).toLowerCase().match(/\.([a-z0-9]+)$/);
  return m ? m[1] : "";
}

function previewFor(file) {
  const extension = ext(file.name);
  const href = assetUrl(file.name);
  const card = document.createElement("a");
  card.className = "brand-asset-card";
  card.href = href;
  card.target = "_blank";
  card.rel = "noopener";
  card.title = file.name;

  if (["svg", "png", "ico"].includes(extension)) {
    const img = document.createElement("img");
    img.src = href;
    img.loading = "lazy";
    img.alt = "";
    card.append(img);
  } else {
    const type = document.createElement("span");
    type.className = "brand-asset-type";
    type.textContent = extension ? extension.toUpperCase() : "FILE";
    card.append(type);
  }

  const name = document.createElement("span");
  name.className = "brand-asset-name";
  name.textContent = file.name.split("/").pop();
  card.append(name);
  return card;
}

async function initAssetLibrary() {
  const host = document.querySelector("#brand-asset-library");
  const count = document.querySelector("#brand-asset-count");
  if (!host || !count) return;

  try {
    const response = await fetch(STATIC_ROOT + "manifest.json", { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("Asset manifest unavailable");
    const manifest = await response.json();
    const files = [
      ...(manifest.files || []).map(file => ({ ...file, name: ASSET_ROOT + file.path })),
      { name: ASSET_ROOT + "manifest.json" },
      { name: ASSET_ROOT + "manifest.txt" }
    ];
    count.textContent = String(files.length);

    const groups = new Map();
    for (const file of files) {
      const key = humanFolder(file.name);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(file);
    }

    const fragment = document.createDocumentFragment();
    for (const [label, groupedFiles] of groups) {
      const group = document.createElement("section");
      group.className = "brand-asset-group";

      const head = document.createElement("div");
      head.className = "brand-asset-group-head";
      const title = document.createElement("h3");
      title.textContent = label;
      const meta = document.createElement("span");
      meta.textContent = groupedFiles.length + " assets";
      head.append(title, meta);

      const grid = document.createElement("div");
      grid.className = "brand-asset-grid";
      groupedFiles.forEach(file => grid.append(previewFor(file)));
      group.append(head, grid);
      fragment.append(group);
    }
    host.replaceChildren(fragment);
  } catch (error) {
    host.textContent = error instanceof Error ? error.message : String(error);
  }
}

window.AVGLBrand = { assetUrl };
initAssetLibrary();
