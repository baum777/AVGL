# AVGL-0296 Activation Gate Draft

**Status:** GATE DRAFT — NON-CANONICAL (prepares the owner ACTIVATE decision for AVGL-0296; binds nothing)
**Date:** 2026-09-19
**Origin:** owner, fifth message on the Input 4 disposition — explicitly *no new decision* versus the last state; confirms the chain 0287 → 0296 → 0295 → 0294 and orders preparation of the 0296 activation gate instead of activating 0294/0295
**Relation:** operationalizes the [AVGL-0296 design input](./AVGL_0296_CONTEXT_PROJECTION_CONTRACT_DESIGN_INPUT.md) and the [invariant review findings F1–F5](./AVGL_0296_INVARIANT_REVIEW_2026-09-19.md); ACTIVATE remains an owner-only decision
**Authority:** [`AVGL_SOURCE_OF_TRUTH.md`](../AVGL_SOURCE_OF_TRUTH.md) remains authoritative; the working plan remains [`AVGL_IMPLEMENTATION_WORKING_PLAN.md`](../AVGL_IMPLEMENTATION_WORKING_PLAN.md). No Source of Truth decision changed.

**Goal:** `ACTIVE 0296` only when all boundaries below are explicit.

---

## Gate 1 — Projection Policy Contract

Open question it closes: *Wie wird entschieden, was sichtbar wird?*

Owner-provided minimal contract (directional):

```yaml
projection_policy:

  identity:
    id: runtime-analysis

  owner:
    governance-reference

  allow:
    objects:
      - runtime.executor

    relations:
      - depends_on

  deny:
    objects:
      - credentials
      - secrets

  evidence_boundary:
    allow:
      - OBSERVED
      - EXPLICIT

    transform:
      INFERRED:
        preserve_as_inferred
```

Key owner point: **`deny` is not a filter alone — it is a declared boundary.**

Mapping: declared-deny + authorization gate = review F1; `owner: governance-reference` = open-question answer 2 / F5; `preserve_as_inferred` = AVGL-0287 INFERRED-distinguishability; deny-listing credential/secrets surfaces aligns with repo AGENTS.md rule 8 (default-deny for obvious credential files).

Formalization notes for activation: schema-first definition (following the AVGL-0210/0213 schema pattern), closed vocabularies for allow/deny targets, and the evidence_boundary grammar must cover all four SoT §15 states (UNKNOWN is handled by the Gate 3 marker, absence by omission).

## Gate 2 — Projection ≠ Evidence

Negative invariant:

```text
Projection
   |
   X
   |
Evidence Creation
```

Owner-provided test:

Input:

```json
{
 "file":"secret.env",
 "state":"hidden"
}
```

Allowed projection output:

```json
{
 "unknown":
   "restricted context"
}
```

Not allowed:

```json
{
 "secret_exists":true,
 "evidence_state":"OBSERVED"
}
```

Mapping: review F2 ("projection output cannot introduce new evidence records or upgrade evidence states"); SoT §15 (semantic meaning is not evidence). Note: the allowed output *is* the boundary-existence marker (Gate 3 / review F3) — the existence of a restriction may be visible, the content may not be asserted, and no evidence state may be fabricated.

## Gate 3 — Unknown Marker

Owner-provided contract:

```json
{
 "field":"database.credentials",

 "visibility":
 {
   "state":"UNKNOWN",

   "reason":
   "not projected"
 }
}
```

Not `null`, because `null` carries no semantics.

Mapping: review F3; SoT §25 (coverage limitations remain visible); repo AGENTS.md "Unknown stays unknown".

Formalization note for activation: distinguish marker reasons in a closed enum — `not_projected` (policy-hidden content in agent packages) versus unevidenced-unknown (IR-level; human-facing projections keep those visible per SoT §25) — so the two epistemic sources of UNKNOWN never blur.

## Gate 4 — Seven-classes negative tests

Activation requires negative tests across WHO / KNOW / THINK / CAN / MAY / ACT / DID, specifically:

- **MAY:** `Projection Permission ≠ MAY` — agent sees `deployment.yaml` does not mean `Agent MAY deploy`.
- **CAN:** `Visible ≠ Capability` — agent knows `database schema` does not mean `Agent CAN modify database`.
- **ACT:** `Context Package ≠ Execution Path`.
- **DID:** `Agent statement ≠ Verification Evidence`.

Mapping: review I1–I3 plus the owner-added ACT inequality; F4 requires these to ship as negative/boundary tests with the activation slice; semantics grounded in SoT §11.

## Gate 5 — Policy Provenance

A projection policy itself needs:

- **WHO** — wer definiert sie?
- **MAY** — wer darf sie ändern?
- **DID** — welche Evidence bestätigt ihre Herkunft?

Owner-provided example (directional):

```yaml
policy:

owner:
  governance

approved:
  true

evidence:
  - ADR-reference
```

Mapping: review F5.

Formalization note for activation: `approved: true` as an in-artifact boolean is self-assertion and cannot carry the approval — the approval must live in an external governance/owner record (e.g. the referenced ADR/governance record) that the policy references; no artifact certifies itself (repo principle: no file creates authority merely by declaring itself).

---

## After the gates: activation and implementation order

Only when all five gates are formalized:

```text
ACTIVATE AVGL-0296
```

Then implementation order:

```text
1. Lens Contract Extension
          |
          v
2. Projection Policy Schema
          |
          v
3. Projection Resolver
          |
          v
4. Context Package Generator
          |
          v
5. Service Worker Sync
```

Steps 1–3 implement AVGL-0296, step 4 activates AVGL-0295, step 5 activates AVGL-0294 — consistent with the owner-ordered chain.

Naming caution for step 3: a "Projection Resolver" must remain inside the PROJECT/lens layer; it is not a new compiler pipeline stage and must not collide with the canonical RESOLVE stage semantics (SoT §18 — same rejection class as previous parallel-pipeline proposals).

## LLM-assist boundary within the projection layer (owner point, "Jev")

Owner-stated: an LLM-assist component ("Jev" — an external concept from owner context, not AVGL vocabulary) could later be used **within** the projection layer, but only for:

```text
Classification / Routing
```

never for:

```text
Authorization
Evidence
Truth
```

Canonical form:

```text
Projection Policy
        |
        v
Jev assists classification
        |
        v
Deterministic AVGL validation
```

not:

```text
Jev decides visibility
```

This preserves the Trust Boundary. Grounding: SoT §24 — an LLM-assisted classification hypothesis remains explicitly distinguishable and never becomes visibility authority, evidence, or IR truth; any such component enters as an adapter behind deterministic validation.
