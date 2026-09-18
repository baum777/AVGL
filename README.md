# AVGL

**Agent Visual Grammar Language** — a human-first way to understand agent systems.

> Show the story, not the graph.

## Architecture authority

The normative architecture and product intent are defined in [`AVGL_SOURCE_OF_TRUTH.md`](AVGL_SOURCE_OF_TRUTH.md). The scoped implementation path from the current v0.1 analyzer to the architecture-first v0.2 model is defined in [`AVGL_IMPLEMENTATION_WORKING_PLAN.md`](AVGL_IMPLEMENTATION_WORKING_PLAN.md).

The current implementation below is the **v0.1 evidence-bound baseline**. Its `WHO → KNOW → THINK → CAN → MAY → ACT → DID` model remains valuable as the Agentic/Governance semantic spine, but it is not the universal AVGL kernel for v0.2.

AVGL analyzes repositories and agent frameworks into a small semantic model that separates identity, context, cognition, technical reach, authority, effects, and evidence.

```text
WHO → KNOW → THINK → CAN → MAY → ACT → DID
```

The user-facing projection is intentionally simpler:

```text
Wer arbeitet hier?
        ↓
Womit arbeitet das System?
        ↓
Wie denkt oder plant es?
        ↓
Was kann es?  +  Was darf es?
        ↓
Was kann reale Wirkung erzeugen?
        ↓
Wie wird das Ergebnis nachgewiesen?
```

## Current v0.1 semantic baseline

The implementation uses an evidence-bound compiler pipeline:

```text
DISCOVER → CLASSIFY → BIND → SYNTHESIZE → PROJECT
```

- **DISCOVER** scans bounded repository text surfaces and skips common secret files.
- **CLASSIFY** maps evidence to AVGL semantic candidates.
- **BIND** creates an AVGL Intermediate Representation (IR) with source evidence and explicit unknowns.
- **SYNTHESIZE** groups accepted evidence into repository-specific semantic families without upgrading evidence strength.
- **PROJECT** renders human-first views from the same IR.

The baseline is deterministic and dependency-free. It does **not** ask an LLM to invent the architecture.

## Deterministic synthesis

AVGL does not stop at generic labels such as `Tool / adapter surface`. Accepted evidence is grouped into bounded families that make the repository easier to understand.

Examples:

```text
THINK → OpenAI models · planning · reasoning · handoffs
CAN   → MCP · filesystem · browser · shell · database · Git
MAY   → authorization · approval · permissions · grants
ACT   → executor · network dispatch · Git mutation · deployment
DID   → verification · receipts · audit · tests · tracing
```

Every synthesized family keeps bounded evidence references. `SYNTHESIZE` cannot revive evidence rejected by the earlier semantic gates, so `UNKNOWN` remains `UNKNOWN`.

```text
raw evidence → semantic gate → bounded families → human story
```

## Web interface

The Vercel-facing interface is intentionally not a graph explorer. It uses three progressive views:

```text
STORY → INSPECT → SYSTEM
```

- **Story** explains the system with synthesized repository-specific families.
- **Inspect** exposes the exact file/line evidence behind each claim.
- **System** shows a fixed semantic frame with an explicit authority boundary; it is not reconstructed topology.

The web endpoint accepts a public GitHub repository URL or `owner/repo`, performs a bounded static scan, and returns the same AVGL IR used by the local CLI.

Private GitHub repository authentication is intentionally not part of this slice. A server-side `GITHUB_TOKEN` is supported when configured by the deployment environment; the token is never accepted from the browser.

## Quick start

Requires Node.js 20+.

```bash
npm test
npm run check
node ./bin/avgl.js analyze .
node ./bin/avgl.js analyze ../some-agent --format card
node ./bin/avgl.js analyze ../some-agent --format json
```

### Example: missing authority stays missing

If a repository exposes a browser tool but contains no recognized authority/policy evidence, AVGL may report:

```text
CAN  Capability surfaces: browser / web.
MAY  Nicht belegt
```

It must never silently convert technical reach into permission.

## Current semantic invariants

```text
HARNESS != AUTHORITY
CONTEXT != PERMISSION
CAN != MAY
PROPOSAL != EXECUTION
ACT != DID
RECEIPT != VERIFICATION
```

## Repository layout

```text
bin/avgl.js                 CLI
src/discover.js             bounded local + virtual-file discovery
src/github-source.js        bounded GitHub repository source adapter
src/classify.js             semantic classification
src/bind.js                 evidence-bound AVGL IR
src/synthesize.js           deterministic semantic family synthesis
src/project.js              CLI Story/Card/JSON projections
api/analyze.mjs             Vercel analysis endpoint
web/index.html              human-first web shell
web/app.js                  Story / Inspect / System renderer
web/styles.css              responsive visual language
schema/avgl-ir-v0.1.json    machine contract
docs/AVGL_V0_1.md           concept and boundaries
test/*.test.js              core, source-adapter, and synthesis invariant tests
```

## Current evidence model

Each semantic claim is bound to file/line/snippet evidence and one of:

- `EXPLICIT`
- `INFERRED`
- `OBSERVED`
- `UNKNOWN`

The v0.1 generic repository scanner emits `INFERRED` evidence. Future framework adapters and runtime traces can provide stronger evidence without changing the seven-class semantic backbone.

## Architecture-first next step

The next implementation program is the v0.2 structural compiler defined in [`AVGL_IMPLEMENTATION_WORKING_PLAN.md`](AVGL_IMPLEMENTATION_WORKING_PLAN.md): structural materialization, multi-identity, evidence-bound typed relations, scope/inheritance/override resolution, effective state, propagation, lenses, and navigable spatial projections.

See [`AVGL_SOURCE_OF_TRUTH.md`](AVGL_SOURCE_OF_TRUTH.md) for the normative definition and [`docs/AVGL_V0_1.md`](docs/AVGL_V0_1.md) for the original v0.1 concept/baseline.
