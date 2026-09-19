# AVGL Structural Optimization Input (Layered Model, Observation/Claim/Provenance) — Dispositioned Input

**Status:** ARCHIVED INPUT — NON-CANONICAL — DISPOSITIONED
**Received:** 2026-09-19 (owner-pasted output of an external session; third input of the 2026-09-19 series; not previously present in this repository)
**Disposition:** Owner decision C, 2026-09-19, applied per the established disposition pattern for this input series (see [AVGL_CONTEXTUAL_UNDERSTANDING_INPUT_2026-09-19.md](./AVGL_CONTEXTUAL_UNDERSTANDING_INPUT_2026-09-19.md) and [AVGL_SEMANTIC_IR_STABILIZATION_INPUT_2026-09-19.md](./AVGL_SEMANTIC_IR_STABILIZATION_INPUT_2026-09-19.md)) — partial adoption as working-plan revisions; source archived verbatim below
**Authority:** This document is input material only and creates no architecture authority. Architecture authority remains [`AVGL_SOURCE_OF_TRUTH.md`](../AVGL_SOURCE_OF_TRUTH.md); the active implementation path remains [`AVGL_IMPLEMENTATION_WORKING_PLAN.md`](../AVGL_IMPLEMENTATION_WORKING_PLAN.md).

## Disposition record

| # | Input concept | Disposition | Location |
|---|---|---|---|
| 1 | Layer separation Artifact → Observation → Semantic → Context → Projection | PARTIALLY COVERED — the canonical compiler pipeline (SoT §18: DISCOVER → EXTRACT → CLASSIFY → BIND → RELATE → RESOLVE → SYNTHESIZE → PROJECT) already separates these concerns; the input's layer names must not fork the pipeline vocabulary | SoT §18; plan §1 |
| 2 | Observation Layer with typed signals (function-call, exception, import) | ADOPTED — observations exist today as lexical line candidates (`src/discover.js`); typed signal records refine EXTRACT and improve debuggability/evals; lexical candidates remain fallback | New ticket AVGL-0216 |
| 3 | Semantic Claims as subject/predicate/object objects | ADOPTED WITH ADJUSTMENT — claims already carry claimId/semanticClass/evidence/confidence (`src/classify.js`); triple framing lands schema-first in the claims contract and must not duplicate or bypass typed relation records | AVGL-0216 |
| 4 | Stronger provenance (origin incl. commit/timestamp; resolution; chain observation → claim → projection) | ADOPTED — per-claim resolver provenance shipped with AVGL-0215 (resolvers, rules, reasons, mode; schema-bound); extensions: immutable source-revision binding and projection provenance | AVGL-0216; AVGL-0212/AVGL-0220 (source/revision metadata) |
| 5 | Identity Layer (id, kind, aliases, inherits, belongs_to) | COVERED + ADOPTED DETAIL — SoT §12 multi-identity model and plan P3 identity records already define this; aliases become a P3 schema detail; inherits/belongs_to already exist in the SoT §14 relation grammar | SoT §12, §14; AVGL-0230 |
| 6 | Context Envelope (who/where/why/depends_on/constrained_by/effects) | ADOPTED as AVGL-0277 refinement — every envelope field renders only from evidenced identities/relations; "why/purpose" stays UNKNOWN without evidence (no narrative hallucination) | AVGL-0277 amendment |
| 7 | Relation vocabulary (implements, provides, consumes, guards, authorizes; no premature `calls`) | ADOPTED WITH ADJUSTMENT — SoT §14 already defines a typed, extensible grammar; the five verbs join the P4 registry with defined semantics, directionality, and evidence requirements before any emission; "import ≠ runtime call" is already a binding invariant | SoT §14, §16; AVGL-0240 amendment |
| 8 | Three-level inheritance model (structural / semantic / context) | ADOPTED — sharpens the P5 scope model; the three levels are distinguished explicitly and never merged into one edge type (consistent with CONTAINMENT != INHERITANCE) | AVGL-0250 amendment |
| 9 | Iconography as renderer system (Semantic IR → Visual Grammar Mapper → Icon) | COVERED — already adopted in AVGL-0287 in exactly this form (renderer-level visual syntax, never a semantic source) | AVGL-0287 |
| 10 | State Layer (status, confidence, lifecycle proposed/approved/deployed/deprecated) | PARTIALLY COVERED + DEFERRED — declared vs. effective state is plan P6; lifecycle phases are temporal scope and stay deferred per SoT §17 (time is not a first-class primitive yet) | Plan P6; SoT §17 |
| 11 | Evaluation Layer (expected/actual/result/reason per resolution) | ADOPTED as test-strategy enhancement — canonical fixtures emit structured eval records so semantic resolution quality becomes measurable over time | Plan §5 amendment |
| 12 | Gesamtmodell and prioritization (P0 Observation + Claim Model → P3 State/Eval) | COVERED — the proposed order confirms the existing plan sequencing: the input's P0s map onto plan P1/P2 work that is already scheduled before AVGL-0277/AVGL-0287 (P7/P8) | Plan §4 |

Notes:

- No Source of Truth decision changed. This input introduces no version-ladder claims (unlike inputs 1–2); its concepts map onto the existing v0.2 program without renaming it.
- The framing "from Classifier to System Understanding Engine Framework" is narrative, consistent with SoT §1 (one coherent structural system model) — it creates no new authority surface.
- Implementation of AVGL-0216 and the ticket amendments awaits the regular plan execution order; nothing in this disposition weakens evidence gates, unknown preservation, or relation evidence requirements.

## Original input (verbatim, archived)

````markdown
Ausgehend von der aktuellen AVGL-Richtung würde ich **nicht zuerst mehr Erkennung hinzufügen**, sondern die interne Struktur stabilisieren. Der größte Hebel liegt darin, dass aus dem Semantic IR später Context, Relations, Iconography und Topology entstehen können, ohne dass jede Schicht eigene Interpretationen baut.

Die wichtigsten Strukturoptimierungen:

---

# 1. Semantic IR in mehrere Ebenen trennen

Aktuell:

```text
Artifact
 ↓
Semantic Classification
 ↓
Evidence
```

Besser:

```text
Artifact Layer

      ↓

Observation Layer

      ↓

Semantic Layer

      ↓

Context Layer

      ↓

Projection Layer
```

## Warum?

Ein File ist nicht direkt eine Bedeutung.

Beispiel:

```text
execution-control.service.ts
```

hat:

```text
Observation:

- contains validateGrant()
- imports policy module
- throws ConflictException


Semantic:

- MAY
- authority boundary


Context:

- Runtime Governance Component


Projection:

- Authority Card Icon
```

Damit wird verhindert:

```text
Code-Signal = Wahrheit
```

---

# 2. Observation Layer einführen

Aktuell springen Scanner vermutlich direkt Richtung Klasse.

Besser:

```yaml
Observation:

source:
  file.ts

signals:

  - type:
      function-call

    value:
      validateGrant()


  - type:
      exception

    value:
      ConflictException


  - type:
      import

    value:
      policy-module
```

Danach:

```text
Observation
      ↓
Resolver
      ↓
Semantic Claim
```

Vorteil:

- bessere Debugbarkeit
- bessere Evals
- weniger Halluzination
- neue Resolver ohne Scannerumbau

---

# 3. Semantic Claims als eigene Objekte

Nicht:

```json
{
 file:"x.ts",
 class:"MAY"
}
```

sondern:

```json
{
 claimId:"claim-001",

 subject:
   "execution-control.service.ts",

 predicate:
   "implements",

 object:
   "authority validation",

 semanticClass:
   "MAY",

 evidence:
   [
    "line 1526"
   ],

 confidence:
   "inferred"
}
```

Damit wird AVGL näher an einer **Systembeschreibungssprache**.

---

# 4. Provenance stärker machen

Aktuell:

```text
Evidence Ref
```

Erweitern zu:

```yaml
Provenance:

origin:

  repository

  file

  commit

  timestamp


resolution:

  resolver

  version

  rule


chain:

  observation
      ↓
  semantic claim
      ↓
  projection
```

Wichtig für Agent-Systeme:

> Warum glaubt AVGL das?

---

# 5. Identity Layer hinzufügen

Gerade wegen deiner ursprünglichen E/E-Vererbungsidee.

Nicht nur:

```text
File
```

sondern:

```text
Identity
```

Beispiel:

```yaml
Identity:

id:
 execution-control

kind:
 component

aliases:

 - execution-control.service
 - grant-validator

inherits:

 - runtime-service

belongs_to:

 - governance-domain
```

Damit wird möglich:

```text
eine Identität
mehrere Repräsentationen
```

---

# 6. Context Lens vorbereiten

AVGL-0277 sollte nicht nur Dateien gruppieren.

Besser:

## Context Envelope

```yaml
Context:

who:

  agent/runtime owner


where:

  system domain


why:

  purpose


depends_on:

  capabilities


constrained_by:

  authority


effects:

  possible actions


evidence:

  refs
```

Beispiel:

```text
Execution Control

WHO:
 Runtime Agent

KNOW:
 Grant Context

MAY:
 Permission Boundary

ACT:
 Execution Dispatch

DID:
 Verification Output
```

---

# 7. Relation Types standardisieren

Nicht direkt Graph bauen.

Erst Relation Vocabulary.

Beispiel:

```yaml
RelationTypes:

containment

belongs_to

implements

extends

consumes

provides

guards

authorizes

produces

verifies
```

Wichtig:

Nicht:

```text
calls
```

zu früh.

Denn:

```text
import ≠ runtime call
```

---

# 8. Inheritance Model definieren

Für deine ursprüngliche Idee:

> mehrere Identitäten / Cross Repo / Vererbung

würde ich drei Ebenen unterscheiden:

---

## Structural inheritance

```text
Base Agent Harness

        ↓

Hotel Agent Harness
```

---

## Semantic inheritance

```text
Capability

        ↓

Email Capability

        ↓

Transactional Email Capability
```

---

## Context inheritance

```text
Workspace Rule

        ↓

Repository Rule

        ↓

Folder Rule

        ↓

File Rule
```

Nicht vermischen.

---

# 9. Iconography als Renderer-System

Aktuell Gefahr:

```text
Icon = Bedeutung
```

Besser:

```text
Semantic IR

    ↓

Visual Grammar Mapper

    ↓

Icon
```

Beispiel:

```yaml
semantic:

 MAY


renderer:

 authority-boundary-icon
```

Icons dürfen darstellen:

- Rolle
- Flussrichtung
- Relation
- Zustand

aber keine neue Information erzeugen.

---

# 10. State Layer ergänzen

Gerade für Agent-Systeme wichtig.

Nicht nur:

```text
Was ist es?
```

sondern:

```text
In welchem Zustand?
```

Beispiel:

```yaml
State:

status:

 active

confidence:

 verified

lifecycle:

 proposed
 approved
 deployed
 deprecated
```

---

# 11. Evaluation Layer einbauen

Für semantische Systeme entscheidend.

Jede Resolution bekommt:

```yaml
Evaluation:

expected:

 MAY


actual:

 MAY


result:

 PASS


reason:

 grant-validation detected
```

Damit entsteht:

```text
Semantic Evals
```

analog zu LLM Evals.

---

# 12. AVGL Gesamtmodell nach Erweiterung

```text
                 Repository


                     |
                     v


              Observation Layer

                     |
                     v


              Semantic IR


                     |
       +-------------+-------------+

       |                           |

 Context Lens              Relation Model


       |                           |

 Role Cards                 Lineage Graph


       +-------------+-------------+

                     |

              Visual Grammar


                     |

              Human System Model
```

---

## Priorisierung

Ich würde priorisieren:

| Priorität | Erweiterung | Nutzen |
|-|-|-|
| P0 | Observation Layer | stabilisiert alles |
| P0 | Semantic Claim Model | bessere Architektur |
| P1 | Provenance Chain | Vertrauen/Evals |
| P1 | Relation Vocabulary | vorbereitet Topology |
| P1 | Identity Layer | Cross Repo / Vererbung |
| P2 | Context Envelope | AVGL-0277 |
| P2 | Icon Renderer | AVGL-0287 |
| P3 | State Layer | Runtime Evolution |
| P3 | Evaluation Layer | Qualitätssicherung |

Der größte Architekturgewinn wäre aus meiner Sicht:

```text
Observation Layer
        +
Semantic Claim Model
        +
Provenance Chain
```

weil dadurch AVGL von einem **Classifier** zu einem **System Understanding Engine Framework** wird, ohne die späteren Relation-/Topology-Schichten vorwegzunehmen.
````
