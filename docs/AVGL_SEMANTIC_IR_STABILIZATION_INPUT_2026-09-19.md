# AVGL Semantic IR Contract Stabilization Specification v0.3 — Dispositioned Input

**Status:** ARCHIVED INPUT — NON-CANONICAL — DISPOSITIONED
**Received:** 2026-09-19 (owner-pasted output of an external session; second input of the context-layer series; not previously present in this repository)
**Disposition:** Owner decision C, 2026-09-19, applied per the established disposition pattern for this input series (see [AVGL_CONTEXTUAL_UNDERSTANDING_INPUT_2026-09-19.md](./AVGL_CONTEXTUAL_UNDERSTANDING_INPUT_2026-09-19.md)) — partial adoption as a working-plan revision; source archived verbatim below
**Authority:** This document is input material only and creates no architecture authority. Architecture authority remains [`AVGL_SOURCE_OF_TRUTH.md`](../AVGL_SOURCE_OF_TRUTH.md); the active implementation path remains [`AVGL_IMPLEMENTATION_WORKING_PLAN.md`](../AVGL_IMPLEMENTATION_WORKING_PLAN.md).

## Disposition record

| Input concept | Disposition | Location |
|---|---|---|
| §3–§8 object model (SemanticIR root, ArtifactIdentity, SemanticClassification primary/secondary, SemanticResolution provenance, EvidenceReference path/line/excerpt/category) | ADOPTED as semantic-claims contract requirements, expressed schema-first — not as TypeScript artifacts | Working plan, new ticket AVGL-0215 |
| §2 core principle (Semantic IR ≠ runtime graph / call graph / dependency graph) | ADOPTED — restates SoT §16 structural invariants for the claims layer | AVGL-0215 |
| §6 resolver contract (resolver, version, rule, mode SEMANTIC/LEXICAL_FALLBACK, reason) | ADOPTED — partially implemented already (`src/semantic-resolution.js:34-39` emits resolver/rule/reason/mode incl. a `legacy.lexical.v0` fallback); ticket makes propagation into the IR consistent and versioned | AVGL-0215 |
| §7 evidence rule (evidence supports a claim; evidence does not become the claim) | ADOPTED — existing invariant, now contract-enforced | AVGL-0215 |
| §8 confidence ladder (explicit/strong/inferred/unknown) | ADOPTED WITH ADJUSTMENT — confidence stays orthogonal to the canonical evidence states (SoT §15: EXPLICIT/INFERRED/OBSERVED/UNKNOWN); current implementation uses numeric confidence; any confidence vocabulary is defined schema-first and must not duplicate or weaken evidence states (new evidence states are issue-first per CONTRIBUTING §6) | AVGL-0215 |
| §9 unknown preservation (Unknown ≠ False, Unknown ≠ Infer) | ADOPTED — existing invariant | AVGL-0215 |
| §10 semantic boundaries (WHO…DID meanings) | COVERED — matches existing vocabulary meanings (SoT §11); no change | — |
| §11 forbidden shortcuts (name matching, documentation/permission/receipt inflation) | ADOPTED — maps to CAN != MAY, ACT != DID, RECEIPT != VERIFICATION and the negative canonical fixtures | AVGL-0215 |
| §12 relation preparation (declared-only relations; no `calls` topology without a topology resolver) | ADOPTED — matches plan P4 relation evidence gates | AVGL-0215 / P4 |
| §13 projection contract (all views consume the IR) | COVERED — SoT §20 ONE IR → MANY VIEWS | — |
| §14 UI contract (UI never derives meaning from filename/icon/color/position/keyword) | ADOPTED — strengthens AVGL-0287 | AVGL-0287 |
| §15 validation checklist incl. negative canonical fixtures | ADOPTED as ticket DoD; the semantic-resolution subset of the currently red main suite (5 red negative fixtures, canonical negatives, documentation-alone, DID acceptance, pipeline expectation) is repaired under this ticket | AVGL-0215 |
| "No additional classes without ADR" | ADJUSTED — this repository has no ADR process; class vocabulary changes go through an explicit Source of Truth revision (SoT §28) | AVGL-0215 |
| "Semantic IR is the Source Contract" kernel framing and version ladder (v0.2 Semantic Classification → v0.3 Stable Semantic IR → v0.4 Context → v0.5 Relation/Lineage → v0.6 Topology) | REJECTED as numbering and framing — collides with the already-taken repository designations v0.3 (Relation/Lineage/Effect), v0.4 (Private Local Workspace), v0.5 (GitHub OAuth UI; package 0.5.0) and again misstates v0.2 (WHO…DID is a vocabulary, not the kernel; SoT §9/§11/§28). Concepts map to existing plan locations: claims stability → AVGL-0215; context → AVGL-0277; relations → P4 + docs v0.3; topology → deferred roadmap | — |
| TypeScript interface artifacts (`interface SemanticIR` etc.) | REJECTED as artifacts — plain-ESM `.js` repository; the contract lands as schema/JSON fields | AVGL-0215 |

Observed grounding (2026-09-19, main @ f8ce7bf): resolver provenance partially present (`src/semantic-resolution.js:34-39`, `legacy.lexical.v0` at line 1077); confidence numeric (`src/detectors.js`, 0.72–0.82); `schema/avgl-ir-v0.1.json` has `confidence` and `evidenceState` fields; no ADR process exists; 5 of 8 negative canonical fixtures (`test/fixtures/semantic-resolution/*-negative.mjs`) plus the synthesize pipeline expectation are red on main. The input's stabilization demand is therefore grounded in a real defect state, not hypothetical.

Notes:

- No Source of Truth decision changed. The claims layer is the agentic-vocabulary contract feeding identities/evidence into the v0.2 IR; stabilizing it does not promote WHO…DID to the universal kernel.
- The mobile-first layout test failure on main is NOT semantic-resolution scope and stays a separate defect finding.
- No detector, schema, or renderer change is part of this disposition itself; `npm test`/`npm run check` are unaffected by the disposition writes.

## Original input (verbatim, archived)

````markdown
# AVGL Semantic IR Contract Stabilization Specification v0.3

## Status

```yaml
spec:
  name: Semantic IR Contract Stabilization
  version: v0.3
  phase: pre-context-layer
  priority: P0
  type: architecture stabilization
```

## Purpose

Stabilize the Semantic Intermediate Representation (Semantic IR) before adding:

- Context Lens (`AVGL-0277`)
- Role Cards (`AVGL-0287`)
- Relation / Lineage / Effect projections
- Future topology reconstruction

The Semantic IR is the contract boundary between:

```text
Repository Evidence
        ↓
Semantic Resolution
        ↓
Semantic IR
        ↓
Future Projections
```

---

# 1. Problem Statement

Current state:

```text
Scanner
  ↓
Evidence
  ↓
Resolver
  ↓
Classification
  ↓
UI
```

The missing stable contract:

```text
Evidence

↓

Semantic Claim

↓

Normalized IR Object

↓

Projection
```

Without a stable IR:

- UI components interpret raw evidence independently
- Context Lens would duplicate resolver logic
- Icons could accidentally encode assumptions
- Relation models could infer unsupported topology

---

# 2. Core Principle

## Semantic IR is the Source Contract

The Semantic IR describes:

```text
"What meaning does the system artifact represent?"
```

It does NOT describe:

```text
"What happens at runtime?"
```

Therefore:

```text
Semantic IR ≠ Runtime Graph
Semantic IR ≠ Call Graph
Semantic IR ≠ Dependency Graph
```

---

# 3. Semantic IR Object Model

## Root Object

```typescript
interface SemanticIR {

  artifact: ArtifactIdentity;

  semantic: SemanticClassification;

  evidence: EvidenceReference[];

  confidence: Confidence;

  provenance: Provenance;

}
```

---

# 4. Artifact Identity

Defines the analyzed object.

```typescript
interface ArtifactIdentity {

  id: string;

  path: string;

  type:
    | "file"
    | "folder"
    | "package"
    | "symbol"
    | "configuration";

  repository?: string;

}
```

Example:

```yaml
artifact:

  path:
    apps/api/src/execution-control/service.ts

  type:
    file
```

---

# 5. Semantic Classification Contract

AVGL Grammar:

```yaml
semantic:

  primary:
    MAY

  secondary:

    CAN
    ACT

  resolver:

    may.authority.v1

  mode:

    SEMANTIC
```

---

## Allowed Classes

```text
WHO
KNOW
THINK
CAN
MAY
ACT
DID
```

No additional classes without ADR.

---

# 6. Resolver Contract

Every semantic claim requires:

```typescript
interface SemanticResolution {

 resolver:
   string;

 version:
   string;

 rule:
   string;

 mode:
   "SEMANTIC"
   |
   "LEXICAL_FALLBACK";

 reason:
   string;

}
```

Example:

```yaml
resolver:

  may.authority.v1

rule:

  grant-validation

reason:

  "validates execution authority boundary"
```

---

# 7. Evidence Contract

Evidence proves why a classification exists.

```typescript
interface EvidenceReference {

 source:

   path: string;


 location:

   lineStart?: number;

   lineEnd?: number;


 excerpt:

   string;


 category:

   | "implementation"
   | "configuration"
   | "documentation"
   | "test";

}
```

---

## Evidence Rule

Important:

```text
Evidence supports a semantic claim.

Evidence does not become the semantic claim.
```

Example:

Wrong:

```text
file contains "execute"
=
ACT
```

Correct:

```text
resolver:
act.effect.v1

evidence:
executor.execute(workOrder)

context:
runtime execution path
```

---

# 8. Confidence Contract

Confidence describes certainty.

Not probability of correctness.

```typescript
type Confidence =

  | "explicit"
  | "strong"
  | "inferred"
  | "unknown";
```

Meaning:

| Level | Meaning |
|-|-|
| explicit | direct declaration |
| strong | multiple supporting signals |
| inferred | semantic interpretation |
| unknown | insufficient information |

---

# 9. Unknown Preservation

Critical invariant:

```text
Unknown ≠ False
Unknown ≠ Infer
```

Example:

No evidence:

```yaml
relation:
  runtime_dependency:
    unknown
```

Not:

```yaml
runtime_dependency:
  false
```

---

# 10. Semantic Boundaries

## WHO

Answers:

```text
Who acts?
```

Examples:

- Agent definitions
- Roles
- Harness identity



---

## KNOW

Answers:

```text
What context/resources exist?
```

Examples:

- Files
- Memory
- Retrieval
- State



---

## THINK

Answers:

```text
Where does reasoning/planning happen?
```

Examples:

- Model routing
- Planning
- Reflection



---

## CAN

Answers:

```text
What capability exists?
```

Examples:

- Tool
- API
- Function
- MCP



---

## MAY

Answers:

```text
What authority exists?
```

Examples:

- Permission
- Policy
- Grant
- Approval



---

## ACT

Answers:

```text
What effect-bearing path exists?
```

Examples:

- Write
- Send
- Deploy
- Mutate



---

## DID

Answers:

```text
What outcome is verified?
```

Examples:

- Verification
- Reconciliation
- Confirmation



---

# 11. Forbidden Semantic Shortcuts

The IR must reject:

## Name matching

```text
execute()
=
ACT
```

False.

---

## Documentation inflation

```text
README says deploy

=
deployment happened
```

False.

---

## Permission inflation

```text
permission exists

=
action happened
```

False.

---

## Receipt inflation

```text
receipt exists

=
verified outcome
```

False.

---

# 12. Relation Preparation

Future relation layer may consume IR.

But Semantic IR itself stores only declared semantic relations:

Allowed:

```yaml
relation:

 type:

   "belongs_to"

 target:

   "runtime-domain"
```

Not yet allowed:

```yaml
calls:

 executor.ts
```

unless a future topology resolver exists.

---

# 13. Projection Contract

All future views consume IR.

Architecture:

```text
                Semantic IR

                    |
       +------------+------------+

       |                         |

 Context Lens              Icon Renderer

       |                         |

 Role Cards                 Visual Grammar


                    |

             Future Topology
```

---

# 14. UI Contract

UI must never derive meaning from:

- filename
- icon
- color
- folder position
- keyword alone

UI receives:

```json
{
 "semantic": "MAY",
 "resolver": "may.authority.v1",
 "confidence": "inferred"
}
```

and renders.

---

# 15. Validation Checklist

## Contract

- [ ] Every classification has resolver provenance
- [ ] Every claim has evidence refs
- [ ] Unknown states preserved
- [ ] No UI inference
- [ ] No icon semantic invention


## Resolver

- [ ] WHO stable
- [ ] KNOW stable
- [ ] THINK stable
- [ ] CAN stable
- [ ] MAY stable
- [ ] ACT stable
- [ ] DID stable


## Tests

Required:

```text
semantic-resolution.test.js

+
positive fixtures

+
negative canonical fixtures

+
provenance assertions

+
unknown handling
```

---

# Definition of Done

Semantic IR stabilization is complete when:

```text
Repository Artifact

        ↓

Evidence

        ↓

Semantic Resolver

        ↓

Stable Semantic IR

        ↓

Context Lens
```

is deterministic.

The next layer may enrich the system model, but may not reinterpret the Semantic IR.

---

## Architectural Result

After this spec:

```text
AVGL

v0.2
Semantic Classification

v0.3
Stable Semantic IR

v0.4
Context Understanding

v0.5
Relation / Lineage

v0.6
Topology Projection
```

Die wichtigste Designentscheidung:

```text
Semantic IR beschreibt Bedeutung.

Nicht Struktur.
Nicht Ablauf.
Nicht Wirkung.

Diese Ebenen werden später darauf aufgebaut.
```
````
