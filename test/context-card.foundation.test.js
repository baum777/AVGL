import assert from "node:assert/strict";
import test from "node:test";
import { composeContextCard } from "../src/context-worker/card-composer.js";

test("context card preserves evidence boundaries", () => {
  const card = composeContextCard({
    id: "artifact.architecture.foundation",
    path: "docs/ARCHITECTURE_FOUNDATION.md",
    type: "documentation",
    role: "architecture-contract",
    avglLayer: "KNOW",
    summary: "Defines architecture boundaries.",
    purpose: "Provides reference context.",
    evidence: {
      state: "EXPLICIT",
      confidence: 0.9
    }
  });

  assert.equal(card.avgl.layer, "KNOW");
  assert.equal(card.evidence.state, "EXPLICIT");
  assert.equal(card.context.purpose, "Provides reference context.");
});
