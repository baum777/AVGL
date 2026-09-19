# AVGL-0294 — Service Worker Context Synchronization Runtime (Design Input)

**Status:** DESIGN INPUT — NON-CANONICAL — DEFERRED (not a working-plan ticket)
**Reserved ID:** AVGL-0294 (reserved by working-plan Revision 2026-09-19 (4); do not reuse this number for unrelated tickets)
**Origin:** Owner decision 2026-09-19 on the fourth dispositioned input of the series ([AVGL_CONTEXT_INTELLIGENCE_LAYER_INPUT_2026-09-19.md](./AVGL_CONTEXT_INTELLIGENCE_LAYER_INPUT_2026-09-19.md)) — reframed from the input's "Service Worker als lokale Analyse-Schicht" and deferred
**Activation:** requires a separate explicit owner decision; until then this document creates no plan ticket, no schema, no code, and no Source of Truth change
**Authority:** [`AVGL_SOURCE_OF_TRUTH.md`](../AVGL_SOURCE_OF_TRUTH.md) remains authoritative; the active path remains [`AVGL_IMPLEMENTATION_WORKING_PLAN.md`](../AVGL_IMPLEMENTATION_WORKING_PLAN.md)

## Definition (owner-reframed)

The service worker is a **Context Synchronization Layer**, not an intelligence layer.

```text
UI
 |
Service Worker
 |
Context Cache
 |
IR Snapshot
 |
Renderer
```

It does not think, classify, decide, or interpret. It keeps the human projection layer fed with current IR state.

## Responsibilities

Allowed:

- cache IR snapshots and derived projections;
- synchronize cache state with analyzer/API results;
- manage refresh/update queues;
- trigger re-analysis and re-render on staleness or explicit request;
- support offline reading of already-synchronized state.

Forbidden:

- semantic decisions or classification;
- producing relations, identities, or effects;
- interpreting architecture;
- reviving evidence rejected by earlier gates (SoT §15).

## Constraints and grounding

- The IR remains the only semantic source (SoT §19); the worker consumes analyzer output, never generates semantics.
- Deterministic baseline first (repo AGENTS.md): background refresh re-runs the deterministic analyzer, it does not add an interpretation path.
- Factual boundary: a service worker cannot observe local file-change events (browser sandbox). Change detection belongs to the analyzer/CLI/watch side; the worker only consumes refresh results. Any activation design must define where the watcher lives.
- Scope position: post-v0.2 web-runtime concern; depends on the v0.2 IR and its artifact/API surface (plan Phase 9) being available first.

## Open questions for the activation decision

1. What is the IR snapshot artifact format and staleness contract (plan AVGL-0290 analyzer output)?
2. Does refresh run via API, CLI-invoked export, or both?
3. Where does file-change watching live, and what events reach the worker?
4. What is the offline degradation story for evidence navigation (AVGL-0282/0286)?
5. Does this stay renderer-side only, or does it need API contract changes (plan AVGL-0292)?
