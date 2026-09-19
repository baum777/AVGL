# AVGL-0296 Schema Draft — Projection Policy, Visibility, Context Package, Provenance

**Status:** SCHEMA DRAFT — NON-CANONICAL DESIGN INPUT (no implementation, no activation, no Source of Truth change)
**Date:** 2026-09-19
**Origin:** owner, sixth message on the Input 4 disposition — explicitly the *only* next artifact slice: translation of design intent into formal contracts as the future implementation basis
**Relation:** formalizes the [AVGL-0296 design input](./AVGL_0296_CONTEXT_PROJECTION_CONTRACT_DESIGN_INPUT.md) and the [activation gate draft G1–G5](./AVGL_0296_ACTIVATION_GATE_DRAFT_2026-09-19.md); grounded in the [invariant review F1–F5](./AVGL_0296_INVARIANT_REVIEW_2026-09-19.md)
**Placement:** this draft deliberately lives in `docs/`, not `schema/` — draft schemas must not sit beside canonical schemas (e.g. `schema/avgl-ir-v0.1.json`) before activation. Machine-readable schemas are produced by Implementation Slice 0296-A, only after an owner ACTIVATE decision.
**Authority:** [`AVGL_SOURCE_OF_TRUTH.md`](../AVGL_SOURCE_OF_TRUTH.md) remains authoritative; the working plan remains [`AVGL_IMPLEMENTATION_WORKING_PLAN.md`](../AVGL_IMPLEMENTATION_WORKING_PLAN.md).

**Closing invariant (owner):**

```text
Structure    =    Effect

aber:

Projection   ≠    Truth Creation
```

---

## 1. Projection Policy Schema

Purpose: defines **welcher Kontext projiziert werden darf** — not "was ist wahr?" but "was darf welcher Consumer sehen?".

Owner-provided contract (directional):

```yaml
projection_policy:

  identity:
    id: runtime-analysis

  owner:
    reference:
      type: governance_record
      id: ADR-xxx

  scope:

    include:
      objects:
        - runtime.executor

      relations:
        - depends_on


    deny:
      objects:
        - credentials
        - secrets


  evidence_boundary:

    allowed_states:
      - EXPLICIT
      - OBSERVED

    inferred_handling:
      mode:
        preserve_as_inferred
```

Semantics and formalization notes:

- **Authorization is a reference, not a boolean.** `owner.reference` points to an external governance record (G5; Negative Test 4). The policy cannot certify itself.
- **Deny precedence (fail-closed):** `deny` overrides `include` on conflict. A declared boundary is never weakened by a broader include.
- **Default without matching policy:** no projection at all (default-deny; mirrors repo AGENTS.md rule 8 for secret surfaces).
- **Completeness over SoT §15 states:** EXPLICIT/OBSERVED pass per `allowed_states`; INFERRED passes only per `inferred_handling` and stays INFERRED-marked (`preserve_as_inferred` = AVGL-0287 distinguishability); UNKNOWN is never projected as content — it surfaces only as the visibility marker of section 2.
- **Relation allow-lists reference the relation registry** (SoT §14; plan AVGL-0240): a policy may only allow relation types that exist in the registry; it cannot invent relation semantics.
- **Stable ids:** policy ids follow the stable-ID discipline (plan AVGL-0211) because package provenance references them.

## 2. Visibility Reason Enum

Separation of two orthogonal axes:

```text
Evidence State ≠ Visibility State
```

Evidence states (SoT §15, frozen): `EXPLICIT`, `OBSERVED`, `INFERRED`, `UNKNOWN`.

Visibility states (new, projection-side only):

```text
VISIBLE        — projected, content present
NOT_PROJECTED  — exists in IR, outside the policy's include scope
RESTRICTED     — exists in IR, explicitly denied (declared boundary)
UNAVAILABLE    — not present in the IR at all (coverage limitation)
```

Owner-provided marker example:

```json
{
 "object":
 "database.credentials",

 "evidence_state":
 "UNKNOWN",

 "visibility":
 "NOT_PROJECTED"
}
```

Meaning: the system asserts nothing about content — it only states that this context is not transmitted.

Formalization notes:

- This two-axis model **supersedes** the single "closed reason enum" note from the gate draft (G3): the reason field becomes the visibility enum, orthogonal to the evidence state.
- `UNAVAILABLE` grounding: SoT §25 — skipped, unsupported, oversized, or excluded surfaces remain visible as coverage limitations; the marker carries that into packages.
- **Marker granularity vs. leak (decided — owner, seventh message 2026-09-19, readiness check A5):** a per-object marker names the hidden object and thereby reveals its existence. **Owner-final: aggregate-only (`boundaries.hidden_count`) for `RESTRICTED`** (explicitly denied classes such as credentials/secrets) — a single restricted marker already leaks "there exists a credential object here"; the finer view belongs to a higher trust zone. Per-object markers remain valid for `NOT_PROJECTED`/`UNAVAILABLE` (ordinary scope omissions).

## 3. Context Package Schema

Transition:

```text
Semantic IR → Projection Policy → Agent Context Package
```

Owner-provided schema (directional):

```json
{
 "package_id":
 "ctx-runtime-analysis-v1",

 "source":
 {
   "projection_policy":
   "runtime-analysis"
 },


 "objects":
 [
   {
    "id":
    "executor",

    "evidence":
    [
      "src/runtime/executor.ts"
    ]
   }
 ],


 "relations":
 [
   {
    "type":
    "depends_on"
   }
 ],


 "constraints":
 [
   "MAY != ACT",
   "DID requires evidence"
 ],


 "boundaries":
 {
   "hidden_count":
   3
 }
}
```

Key owner point: **der Agent erhält Grenzen mit — nicht nur Inhalte** (`boundaries`, plus visibility markers per section 2).

Formalization notes:

- **IR snapshot binding:** the package must bind the immutable IR/repository revision it was projected from (workspace invariant: repositories bind to immutable revisions), not only the policy id; otherwise provenance cannot reproduce the projection.
- **Relation endpoints:** a relation entry may only reference objects visible in the same package; a relation with a non-projected endpoint degrades to a bounded marker, never a dangling or guessed endpoint.
- `constraints` are vocabulary invariants traveling with the package (0295 contract); they are assertions *about* the model, not new facts.

## 4. Provenance Contract

Every projection output records:

```text
WHO · WHAT · FROM WHERE · UNDER WHICH POLICY
```

Owner-provided example (directional):

```json
{
 "projection":

 {
   "created_by":
   "context-projection-engine",

   "policy":
   "runtime-analysis",

   "sources":
   [
     "executor.ts"
   ],


   "timestamp":
   "..."
 }
}
```

Formalization notes:

- **Executor ≠ authorizer.** `created_by` identifies the deterministic component (engine id + version); the *authority* remains the governance record behind the policy (G5). Provenance should carry both: engine identity and policy authorization reference.
- **Audit trail (F5):** policy applications are recorded per package — policy id + revision, governance record reference, projected IR revision, engine version.
- **Determinism boundary:** same IR snapshot + same policy revision must yield identical package *content*; the provenance envelope (timestamp) may vary. Provenance must not make the projection result irreproducible (repo determinism discipline, SoT §24).

## 5. Negative Test Matrix

The most important part (owner). These become concrete negative fixtures in Implementation Slice 0296-A (step 4), following the repo's negative-fixture pattern.

**Test 1 — Projection erzeugt keine Evidence** (G2 / F2):

```text
Input:    unknown file
Output:   package
Expected: UNKNOWN remains UNKNOWN
```

**Test 2 — Visibility erzeugt keine Authority** (G4 / I1+I2):

```text
Input:    agent sees deployment.yaml
Expected: CAN unchanged · MAY unchanged
```

**Test 3 — Agent Response erzeugt kein DID** (G4 / I3):

```text
Input:    Agent: "deployment successful"
Expected: NOT DID
```

**Test 4 — Policy autorisiert sich nicht selbst** (G5):

```text
Input:    policy: approved=true
Expected: FAIL  (when no governance reference record exists)
```

---

## After this draft

```text
OWNER DECISION → ACTIVATE AVGL-0296
```

Then Implementation Slice 0296-A:

```text
1. Schema (machine-readable, schema/)
2. Validator
3. Projection Evaluator
4. Negative Fixtures
5. Tests
```

Then AVGL-0295 (Agent Context Package), then AVGL-0294 (Runtime Synchronization) — unchanged owner-ordered chain.
