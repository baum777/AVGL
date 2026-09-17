# AVGL

**Agent Visual Grammar Language** — a human-first way to understand agent systems.

> Show the story, not the graph.

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

## v0.1 kernel

The first implementation establishes an evidence-bound compiler pipeline:

```text
DISCOVER → CLASSIFY → BIND → PROJECT
```

- **DISCOVER** scans bounded repository text surfaces and skips common secret files.
- **CLASSIFY** maps evidence to AVGL semantic candidates.
- **BIND** creates an AVGL Intermediate Representation (IR) with source evidence and explicit unknowns.
- **PROJECT** renders human-first views from the same IR.

The baseline is deterministic and dependency-free. It does **not** ask an LLM to invent the architecture.

## Web interface

The first Vercel-facing interface is intentionally not a graph explorer. It uses three progressive views:

```text
STORY → INSPECT → SYSTEM
```

- **Story** explains the system in plain language.
- **Inspect** exposes the exact file/line evidence behind each claim.
- **System** shows a fixed readable flow with an explicit authority boundary.

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
CAN  Tool / adapter surface
MAY  Nicht belegt
```

It must never silently convert technical reach into permission.

## Core invariants

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
src/project.js              CLI Story/Card/JSON projections
api/analyze.mjs             Vercel analysis endpoint
web/index.html              human-first web shell
web/app.js                  Story / Inspect / System renderer
web/styles.css              responsive visual language
schema/avgl-ir-v0.1.json    machine contract
docs/AVGL_V0_1.md           concept and boundaries
test/*.test.js              core and source-adapter invariant tests
```

## Current evidence model

Each semantic claim is bound to file/line/snippet evidence and one of:

- `EXPLICIT`
- `INFERRED`
- `OBSERVED`
- `UNKNOWN`

The v0.1 generic repository scanner emits `INFERRED` evidence. Future framework adapters and runtime traces can provide stronger evidence without changing the seven-class semantic backbone.

## Next slices

1. private repository authentication;
2. framework adapter interface;
3. AST-backed JavaScript/TypeScript adapter;
4. MCP manifest adapter;
5. relation/call-path extraction;
6. runtime trace ingestion.

See [`docs/AVGL_V0_1.md`](docs/AVGL_V0_1.md) for the concept.
