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
- **PROJECT** renders a human-readable Story, Harness Card, or JSON IR.

The baseline is deterministic and dependency-free. It does **not** ask an LLM to invent the architecture.

## Quick start

Requires Node.js 20+.

```bash
npm test
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
src/discover.js             bounded repository discovery
src/classify.js             semantic classification
src/bind.js                 evidence-bound AVGL IR
src/project.js              human-first projections
src/detectors.js            deterministic baseline detectors
schema/avgl-ir-v0.1.json    machine contract
docs/AVGL_V0_1.md           concept and boundaries
test/analyze.test.js         core invariant tests
```

## Current evidence model

Each semantic claim is bound to file/line/snippet evidence and one of:

- `EXPLICIT`
- `INFERRED`
- `OBSERVED`
- `UNKNOWN`

The v0.1 generic repository scanner emits `INFERRED` evidence. Future framework adapters and runtime traces can provide stronger evidence without changing the seven-class semantic backbone.

## Next slices

1. framework adapter interface;
2. AST-backed JavaScript/TypeScript adapter;
3. MCP manifest adapter;
4. relation/call-path extraction;
5. runtime trace ingestion;
6. progressive Story → Inspect → System visualization.

See [`docs/AVGL_V0_1.md`](docs/AVGL_V0_1.md) for the concept.
