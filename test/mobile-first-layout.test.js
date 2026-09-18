import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const html = readFileSync(new URL("../web/index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../web/mobile-first.css", import.meta.url), "utf8");
const entry = readFileSync(new URL("../web/app-entry.js", import.meta.url), "utf8");

describe("mobile-first layout contracts", () => {
  it("loads the mobile-first stylesheet and app entry", () => {
    assert.match(html, /href="\/mobile-first.css"/);
    assert.match(html, /src="\/app-entry.js"/);
    assert.doesNotMatch(html, /src="\/app.js"/);
  });

  it("keeps a compact header with overflow navigation", () => {
    assert.match(html, /id="header-menu"/);
    assert.match(html, /id="header-nav"/);
    assert.match(css, /min-height:var\(--header-h\)/);
    assert.match(css, /@media \(min-width:900px\)/);
  });

  it("separates public, disconnected and connected analyze states", () => {
    assert.match(html, /id="connect-github-cta"/);
    assert.match(html, /id="private-disconnected"/);
    assert.match(html, /id="analyze-button"/);
    assert.match(html, /id="analyze-private-button"/);
    assert.match(entry, /private_disconnected/);
    assert.match(entry, /private_connected/);
    assert.match(css, /data-analyze-state="private_disconnected"/);
  });

  it("moves brand poster and asset library behind the primary flow", () => {
    const heroIndex = html.indexOf('class="hero"');
    const analyzeIndex = html.indexOf('id="analyze-form"');
    const resultIndex = html.indexOf('id="result"');
    const brandIndex = html.indexOf("brand-showcase");
    assert.ok(heroIndex < analyzeIndex);
    assert.ok(analyzeIndex < resultIndex);
    assert.ok(resultIndex < brandIndex);
    assert.match(css, /\.hero-visual\{display:none\}/);
    assert.match(html, /id="asset-categories"/);
    assert.match(entry, /renderAssetLibrary/);
  });

  it("keeps the assistant as a compact mobile FAB", () => {
    assert.match(css, /width:56px/);
    assert.match(css, /body\.input-focused \.assistant-fab/);
    assert.match(entry, /bindMobileChrome/);
  });
});
