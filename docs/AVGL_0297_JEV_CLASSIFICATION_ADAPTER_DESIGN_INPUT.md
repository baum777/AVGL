# AVGL-0297 — Jev Classification Adapter (Design Input)

**Status:** DESIGN INPUT — NON-CANONICAL — DEFERRED (design phase; not an implementation ticket)
**Reserved ID:** AVGL-0297 (reserved by working-plan Revision 2026-09-19 (9); "no design-input doc until ordered" — this document is that ordered doc, owner order 2026-09-20)
**Origin:** Owner order 2026-09-20 ("AVGL-0297 — Jev Classification Adapter, Detailed Scoped Implementation Prompt"), ninth message of the context-layer series after the pre-activation closure (Revision 2026-09-19 (10))
**Activation:** requires a separate explicit owner design approval + activation decision; until then this document creates no `schema/` file, no runtime code, no test, and no Source of Truth change
**Authority:** [`AVGL_SOURCE_OF_TRUTH.md`](../AVGL_SOURCE_OF_TRUTH.md) remains authoritative; the active path remains [`AVGL_IMPLEMENTATION_WORKING_PLAN.md`](../AVGL_IMPLEMENTATION_WORKING_PLAN.md)

## Purpose

AVGL-0297 introduces a controlled, **non-authoritative classification assistance layer**: the external Jev model (provider `typesafe`, model `jev-1.13`) may propose candidate semantic labels from already-extracted repository signals. Jev assists classification; it is not a semantic authority layer, not an evidence generator, not an authorization component.

```text
Raw Repository Signals

        ↓

Jev Classification Assistance

        ↓

Candidate Semantic Labels

        ↓

Deterministic AVGL Validation

        ↓

Evidence-backed Semantic Representation
```

This is the sanctioned form of AGENTS.md design rule 7 ("Deterministic baseline first. LLM-assisted classification may augment the analyzer later, but it must not replace inspectable deterministic evidence") and the SoT §24 LLM-assist boundary (classification/routing only — never authorization, evidence, truth, or visibility).

## Architectural position

AVGL-0297 sits between deterministic extraction and semantic resolution:

```text
Repository / Workspace

        ↓

Deterministic Extraction Layer

        ↓

AVGL-0297
Jev Classification Adapter

        ↓

Semantic Resolver

        ↓

Evidence / Provenance Layer

        ↓

AVGL-0296 Projection Contract

        ↓

Context Package

        ↓

Agent Runtime
```

**Formalization note (pipeline naming, SoT §18).** AVGL-0297 introduces **no new pipeline stage name** (new pipeline names were rejected at the Input 4 disposition). The frozen pipeline remains `DISCOVER → EXTRACT → CLASSIFY → BIND → RELATE → RESOLVE → SYNTHESIZE → PROJECT`. The adapter is an **optional assist adapter inside the existing stages**: it may augment `CLASSIFY` (candidate roles) and `RELATE` (candidate relations) upstream of the resolver. It never replaces a deterministic stage and is never a stage of its own.

Relationship to the deferred chain: 0297 is **upstream** of the projection chain (0287 → 0296 → 0295 → 0294). Jev candidates may enrich `KNOW`/`THINK`-class semantics inside the IR; whatever enters the IR still leaves toward agents only through the AVGL-0296 projection contract once activated. Both layers share the same boundary family: model output is never evidence and never authority.

## Core invariants

```text
Model Output ≠ Evidence

Classification ≠ Resolution

Prediction ≠ Authority

Visibility ≠ Capability

Agent Output ≠ DID

Engine Execution ≠ Authority

Classification Assistance ≠ Semantic Authority
```

(The first five are the owner's invariants for this slice; the last two extend the five immutable guards recorded in the AVGL-0296 activation readiness check, Revision 2026-09-19 (9).)

## Non-goals

Do NOT implement:

- authority decisions
- permission evaluation
- MAY resolution
- CAN capability grants
- ACT execution decisions
- DID verification
- projection permissions
- visibility decisions
- truth generation
- autonomous semantic mutation

Jev output must never become:

```text
System Truth
```

## Input contract

Jev receives **only extracted signals**. Example (owner-provided):

```json
{
  "object_id": "src/runtime/executor.ts",

  "signals": [
    {
      "type": "import",
      "value": "workflow-engine"
    },
    {
      "type": "function",
      "value": "execute"
    },
    {
      "type": "path",
      "value": "runtime/"
    }
  ]
}
```

Jev does NOT receive:

- credentials
- secrets
- permissions
- user identity
- execution state

**Formalization note (private-source boundary).** Signals are metadata pairs (`type`/`value`), not source content. Signal values must never carry raw source, `snippet`, `content`, or `excerpt` fields (the `LOCAL_PRIVATE` transport invariant applies to the Jev call path as well). Jev is a remote model provider; per the private-source invariants, private-repository source must not be sent to a remote model provider by default. Therefore: for `LOCAL_PRIVATE` analyses the adapter is **off by default** and may only be enabled by an explicit owner decision with redacted (signal-only) payloads; the signal extraction step must enforce redaction **before** the adapter call, structurally, not by convention.

## Output contract

Jev returns (owner-provided example):

```json
{
  "classification": {
    "candidate_role": "runtime_component"
  },

  "confidence": {
    "type": "model_output"
  },

  "model":
  {
    "provider": "typesafe",
    "name": "jev-1.13"
  }
}
```

The output is:

```text
candidate classification
```

not:

```text
semantic truth
```

**Formalization note (confidence).** `confidence.type: "model_output"` is *confidence provenance* per the AVGL-0287 owner-final confidence model: it records where the confidence came from, never how much the claim is worth as evidence. It never upgrades the evidence state.

## Evidence boundary and provenance

Every Jev result must carry (owner-provided):

```json
{
  "provenance": {

    "input_sources": [
      "repository-signals"
    ],

    "generated_by":
    "jev-classifier",

    "evidence_state":
    "INFERRED"
  }
}
```

Never:

```json
{
 "evidence_state":
 "OBSERVED"
}
```

because Jev did not observe reality.

**Formalization note (evidence states).** `INFERRED` is within the canonical SoT §15 four states (`EXPLICIT` / `OBSERVED` / `INFERRED` / `UNKNOWN`) — unlike the earlier DERIVED question, **no state extension and no SoT revision is required**. A Jev-derived label enters the IR (after validation) as an `INFERRED` claim whose derivation chain names the validator and the supporting signals, per the AVGL-0215/0216 provenance-chain contracts; state and derivation mechanism stay separated (Revision 2026-09-19 (5)).

## Semantic class restrictions

### Allowed — Jev may assist

```text
KNOW
THINK
candidate classification
relationship suggestion
role suggestion
routing suggestion
```

**Formalization note (routing).** "Routing suggestion" means *classification routing* (which analyzer/lens/view a candidate belongs to), not request routing to providers and never authority routing.

### Forbidden — Jev must never resolve

```text
CAN
MAY
ACT
DID
```

Forbidden output shapes:

```json
{
 "CAN":
 true
}
```

```json
{
 "MAY":
 "allowed"
}
```

```json
{
 "DID":
 "verified"
}
```

**Formalization note (structural enforcement).** The forbidden classes are enforced structurally, not just semantically: the adapter's output normalizer accepts only the declared candidate fields and drops/rejects everything else (deny-by-default field filter), so a forbidden field can never pass through even if a model emits it.

## Adapter responsibilities (Phase 3, after design approval)

Suggested location:

```text
src/
└── semantic/
    └── jev-adapter.js
```

Responsibilities:

```text
receive extracted signals

        ↓

validate input

        ↓

call Jev

        ↓

normalize output

        ↓

attach provenance

        ↓

return candidate classification
```

The adapter must NOT:

- write repository state
- modify Semantic IR directly
- modify evidence states
- bypass validators

## Validation layer (Phase 4, after design approval)

Every Jev result must pass deterministic validation. Example:

Input:

```text
candidate_role:
runtime_component
```

Validation:

```text
Does path indicate runtime?
Do imports support this?
Do relations support this?
```

Only after validation:

```text
accepted semantic candidate
```

Otherwise:

```text
UNKNOWN / rejected candidate
```

**Formalization note (determinism boundary).** Jev is non-deterministic; the deterministic pipeline must stay reproducible (same IR + same inputs = same output). Therefore a candidate label can never be the sole basis of an accepted claim: the validator must independently re-derive support from the recorded signals. If the deterministic validator cannot support the candidate, the result is `UNKNOWN`/rejected — Jev disagreement with the validator never wins.

## Failure handling

Fail closed. If Jev fails:

```text
No classification
        |
        v
Continue with deterministic extraction
```

Never:

```text
Jev unavailable
        |
        v
unknown truth
```

Jev is optional; AVGL continues deterministically without it.

## Negative fixtures (Phase 5, after design approval)

## Test 1

Jev says:

```text
runtime_component
```

but no supporting signals exist.

Expected:

```text
candidate rejected
```

## Test 2

Jev says:

```text
deployment authority
```

Expected:

```text
invalid output

MAY untouched
```

## Test 3

Jev says:

```text
execution completed
```

Expected:

```text
DID unchanged
```

## Test 4

Jev unavailable.

Expected:

```text
AVGL continues deterministically
```

Jev is optional.

## Activation criteria and completion checklist

Current state: **design phase complete for this document; implementation not started (owner-gated)**.

```text
[x] Design Input exists
[x] Architecture position documented
[x] Jev boundary documented
[x] Input contract defined
[x] Output contract defined
[ ] Provenance enforced            (implementation phase)
[ ] Negative fixtures pass         (implementation phase)
[ ] CAN/MAY/ACT/DID isolation verified  (implementation phase)
[ ] npm check passes               (implementation phase; current baseline 84/83/1 with one pre-existing failure)
[ ] tests pass                     (implementation phase)
[ ] Implementation does not create truth  (continuous)
```

Activation requires the owner's explicit design approval + activation decision. Implementation order for the activated slice: adapter (`src/semantic/jev-adapter.js`) → deterministic validation layer → negative fixtures 1–4 → `npm run check` + `npm test` with recorded counts (total / added / failures / pre-existing failures).

## Commit boundary

Separate commits (owner-ordered):

1. `docs: add AVGL-0297 Jev classification adapter design` — only documentation (this file + working-plan entry).
2. After activation: `feat: implement AVGL-0297 Jev classification adapter` — only `src/` and `test/`.

## Final architectural rule

The adapter exists to improve understanding:

```text
Jev helps AVGL classify.
```

It does not become:

```text
Jev defines what AVGL knows.
```

Final invariant:

```text
Classification Assistance
        ≠
Semantic Authority
```
