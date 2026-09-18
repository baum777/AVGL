const ASSET_ROOT = "AVGL_FULL_ASSET_PACKAGE/";
const API = "/api/asset-extract";

function assetUrl(path) {
  const full = path.startsWith(ASSET_ROOT) ? path : ASSET_ROOT + path;
  return API + "?raw=1&path=" + encodeURIComponent(full);
}

function humanFolder(path) {
  const parts = path.replace(ASSET_ROOT, "").split("/");
  if (parts.length < 2) return "Package";
  return parts.slice(0, -1).join(" / ").replace(/^\d+_/, "").replaceAll("_", " ");
}

function ext(path) {
  const m = path.toLowerCase().match(/\.([a-z0-9]+)$/);
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

  if (["svg", "png"].includes(extension)) {
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
    const response = await fetch(API + "?list=1", { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("Asset manifest unavailable");
    const payload = await response.json();
    count.textContent = String(payload.count || 0);

    const groups = new Map();
    for (const file of payload.files || []) {
      const key = humanFolder(file.name);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(file);
    }

    const fragment = document.createDocumentFragment();
    for (const [label, files] of groups) {
      const group = document.createElement("section");
      group.className = "brand-asset-group";

      const head = document.createElement("div");
      head.className = "brand-asset-group-head";
      const title = document.createElement("h3");
      title.textContent = label;
      const meta = document.createElement("span");
      meta.textContent = files.length + " assets";
      head.append(title, meta);

      const grid = document.createElement("div");
      grid.className = "brand-asset-grid";
      files.forEach(file => grid.append(previewFor(file)));
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
