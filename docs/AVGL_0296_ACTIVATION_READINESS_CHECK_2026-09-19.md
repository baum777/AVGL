# AVGL-0296 Activation Readiness Check

**Status:** READINESS CHECK — NON-CANONICAL (freezes the five implicit contract decisions as the activation checklist; binds nothing; the only remaining relevant decision is the owner's `ACTIVATE AVGL-0296`)
**Date:** 2026-09-19
**Origin:** owner, seventh message on the Input 4 disposition — no new architecture decision; freezes the five implicit contract decisions from the [schema draft](./AVGL_0296_SCHEMA_DRAFT_2026-09-19.md) and confirms the slice is ready for the ACTIVATE decision. No code before activation.
**Chain:** [design input](./AVGL_0296_CONTEXT_PROJECTION_CONTRACT_DESIGN_INPUT.md) → [invariant review F1–F5](./AVGL_0296_INVARIANT_REVIEW_2026-09-19.md) → [gate draft G1–G5](./AVGL_0296_ACTIVATION_GATE_DRAFT_2026-09-19.md) → [schema draft](./AVGL_0296_SCHEMA_DRAFT_2026-09-19.md) → **this check** → owner ACTIVATE decision.
**Authority:** [`AVGL_SOURCE_OF_TRUTH.md`](../AVGL_SOURCE_OF_TRUTH.md) remains authoritative; no Source of Truth decision changed.

---

## A1 — Draft → Canonical Boundary — `READY`

```text
docs/   → design contracts
schema/ → canonical contracts after activation
```

Kein vorzeitiges Schema-Material. (Matches the schema-draft placement rule.)

## A2 — Projection Policy Semantik — `READY_WITH_IMPLEMENTATION_REQUIREMENT`

Finale Regeln:

```text
allow + deny   with   deny > allow

no matching policy → no projection
```

Fail-closed. (Implementation requirement: these precedence/default rules must be implemented exactly as specified — schema draft §1 formalization notes.)

## A3 — State Separation — `READY`

```text
┌─────────────────────┐      ┌─────────────────────┐
│ Evidence State      │      │ Visibility State    │
├─────────────────────┤      ├─────────────────────┤
│ EXPLICIT            │      │ VISIBLE             │
│ OBSERVED            │      │ NOT_PROJECTED       │
│ INFERRED            │      │ RESTRICTED          │
│ UNKNOWN             │      │ UNAVAILABLE         │
└─────────────────────┘      └─────────────────────┘
```

Keine Vermischung. (Evidence: SoT §15 frozen; Visibility: projection-side only, schema draft §2.)

## A4 — Package Reproducibility — `READY`

Minimum package binding:

```yaml
context_package:

  ir_binding:
    revision

  policy_binding:
    policy_id

  objects:
    visible_objects

  relations:
    visible_relations

  provenance:
    projection_record
```

Invariant:

```text
same IR + same Policy = same Package Content
```

(Provenance envelope may vary; content stays reproducible — schema draft §4 determinism boundary.)

## A5 — Restricted Marker Decision — `DECIDED` (owner, 2026-09-19)

The only open point from the schema draft is now closed: **the aggregate-only default for RESTRICTED is retained (owner-final).**

```json
{
 "boundaries":
 {
   "hidden_count": 4
 }
}
```

instead of:

```json
{
 "hidden":
 [
   "database.credentials"
 ]
}
```

Owner rationale: a single restricted marker can already leak metadata — *"there exists a credential object here."* The finer view belongs to a higher trust zone.

---

## Nach Activation: 0296-A Reihenfolge (owner-final for the slice)

```text
0296-A-01  Projection Policy Schema
        |
        v
0296-A-02  Policy Validator
        |
        v
0296-A-03  Projection Evaluator
        |
        v
0296-A-04  Context Package Generator
        |
        v
0296-A-05  Negative Fixtures + Tests
```

Nicht: UI → Agent → nachträgliche Regeln.

Note: this ordering refines the earlier mixed five-step order from the gate draft (which spanned 0296–0294): the Context Package Generator is part of the 0296-A slice (A-04); whether A-04 also constitutes the full activation of AVGL-0295 remains part of the ACTIVATE scoping decision. AVGL-0294 (sync runtime) stays after AVGL-0295 as before.

## Jev Integration bleibt separat — AVGL-0297 reserved

If activated later:

```text
AVGL-0297 — Jev Classification Adapter
```

Position:

```text
Signals → Jev → Candidate Label → AVGL Validator → Semantic IR
```

Nicht Teil von 0296. ("Jev" remains an external owner concept, not AVGL vocabulary; any future adapter lands behind deterministic validation per SoT §24. The number AVGL-0297 is hereby reserved; no design-input document is created until its owner orders one.)

## Finaler Architekturzustand vor Activation

```text
Evidence
   → Semantic IR
      → Context Projection Contract
         → Agent Context Package
            → Agent Runtime
               → Optional Sync Runtime
```

Unveränderliche Guards:

```text
Projection ≠ Truth Creation
Visibility ≠ Capability
MAY ≠ Projection Permission
Agent Output ≠ DID
Engine Execution ≠ Authority
```

(The fifth guard, `Engine Execution ≠ Authority`, formalizes the review's executor≠authorizer separation.)

---

**Slice status:** bereit für die Owner-Entscheidung `ACTIVATE AVGL-0296`. Erst danach sollte Code entstehen.

---

## Pre-Activation Phase Closure (owner, eighth message, 2026-09-19)

```text
AVGL-0296
Design Phase         PASS
Activation Readiness READY
```

Gate evaluation (owner):

```text
G1 Projection Policy          PASS
G2 Projection ≠ Evidence      PASS
G3 Unknown Boundary           PASS
G4 WHO→DID Invariants         PASS
G5 Policy Provenance          PASS
```

Additional frozen rule (sharpens A3): **no conversion between the axes** —

```text
NOT_PROJECTED ≠ UNKNOWN
```

Visibility states never convert into evidence states and vice versa; `NOT_PROJECTED` asserts only "Dieser Kontext wird nicht übertragen", never anything about evidence.

AVGL-0297 boundary confirmed: `0297 = optional classification adapter`, not `semantic authority` (Signals → Jev → Candidate Classification → AVGL Validation → Semantic IR).

**Die Pre-Activation-Phase ist abgeschlossen.** No open design questions within the current scope; the single remaining owner gate is `ACTIVATE AVGL-0296`, followed by 0296-A-01 → A-05, then AVGL-0295, later AVGL-0294. Architecture path unchanged: Evidence → Semantic IR → Projection Governance → Context Package → Agent.
