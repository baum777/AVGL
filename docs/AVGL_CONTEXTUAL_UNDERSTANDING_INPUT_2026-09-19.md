# AVGL Contextual Understanding Layer Specification v0.3 — Dispositioned Input

**Status:** ARCHIVED INPUT — NON-CANONICAL — DISPOSITIONED
**Received:** 2026-09-19 (owner-pasted output of an external session; not previously present in this repository)
**Disposition:** Owner decision C, 2026-09-19 — partial adoption as a working-plan revision; source archived verbatim below
**Authority:** This document is input material only and creates no architecture authority. Architecture authority remains [`AVGL_SOURCE_OF_TRUTH.md`](../AVGL_SOURCE_OF_TRUTH.md); the active implementation path remains [`AVGL_IMPLEMENTATION_WORKING_PLAN.md`](../AVGL_IMPLEMENTATION_WORKING_PLAN.md).

## Disposition record

| Input concept | Disposition | Location |
|---|---|---|
| Layer 3 Context Object (identity, domain, purpose, parents/children, relations) | ADOPTED as Context lens framing over the v0.2 IR — not as a new resolver layer | Working plan, new ticket AVGL-0277 |
| Layer 4 System Understanding (system image from artifact relations) | COVERED by existing plan scope — propagation and navigation already answer this | Working plan AVGL-0262, AVGL-0280–0286 |
| Role card UI with relations and evidence count (input §5) | ADOPTED as projection detail | Working plan, new ticket AVGL-0287 |
| Icon grammar as visual syntax (input §3) | ADOPTED as renderer-level visual syntax only; never a semantic source | Working plan AVGL-0287 |
| Layer 1/2 (text layer, semantic layer) | COVERED — existing Story/Inspect projections and agentic vocabulary | SoT §20; plan AVGL-0272/0273 |
| Premise "v0.2 erzeugt einen semantischen Rahmen (WHO…DID)" | REJECTED — misstates the frozen kernel decision: WHO…DID is a vocabulary/lens, the kernel is OBJECT…IDENTITY | SoT §9, §11, §28 |
| Separate Context Resolver pipeline (Scanner → Semantic Resolver → Context Resolver → Projection Engine, input §6 Phase 2) | REJECTED — parallel pipeline naming; the canonical pipeline remains DISCOVER → EXTRACT → CLASSIFY → BIND → RELATE → RESOLVE → SYNTHESIZE → PROJECT | SoT §18 |
| `src/context/context-resolution.ts` (input §6 Phase 1) | REJECTED — TypeScript is off-pattern for this ESM/`.js` repo; context resolution belongs in the IR/lens layer, not a new file family | Repo `package.json` check script; plan P7 |
| Evidence-free relation assertions (`consumes`/`protects`/`produces`, `parents`, `purpose` without evidence refs) | REJECTED — every asserted relation/state must be evidence-bound or explicitly UNKNOWN; new claim types must define evidence requirements | SoT §15, §16; repo AGENTS.md; plan P4 |
| Input version labels "v0.3"/"v0.4" | REJECTED as version steps — the repository v0.3 designation is already taken and remains unaffected; this input creates no AVGL version | [`docs/AVGL_RELATION_LINEAGE_EFFECT_V0_3.md`](./AVGL_RELATION_LINEAGE_EFFECT_V0_3.md) |
| v0.4 question "Wie wirkt es tatsächlich im System?" (runtime truth) | DEFERRED — matches the already-deferred temporal/runtime roadmap | SoT §17; plan §7 |

Notes:

- No Source of Truth decision changed. SoT §5.1 (CONTEXT dimension) and §5.2 (Context lens family) already authorize this materialization; the adoption is a working-plan refinement, not an SoT revision.
- No detector, schema, or renderer change is part of this disposition. `npm test` and `npm run check` are unaffected.
- CONTRIBUTING §6 issue-first areas are untouched (no kernel, frozen-decision, evidence-state, relation-meaning, or compatibility change).

## Original input (verbatim, archived)

````markdown
# AVGL Contextual Understanding Layer Specification v0.3

## Structural Extension: From Semantic Classification to System Understanding

## 0. Zieldefinition

AVGL v0.2 erzeugt einen **semantischen Rahmen**:

```text
Repository Artifact
        ↓
Semantic Classification
        ↓
WHO / KNOW / THINK / CAN / MAY / ACT / DID
```

v0.3 erweitert dies um:

```text
Repository Artifact
        ↓
Semantic Meaning
        ↓
Contextual Identity
        ↓
System Role
        ↓
Relationship Model
        ↓
Human Understanding
```

Ziel:

Nicht nur:

> "Welche Bedeutung hat dieses File?"

sondern:

> "Welche Rolle spielt dieses Artefakt im Gesamtsystem, mit welchen anderen Elementen steht es in Beziehung und welche Wirkung kann daraus entstehen?"

---

# 1. AVGL Darstellungsschichten

## Layer 1 — Text Layer

### Aufgabe

Menschen lesbare Beschreibung.

Beispiel:

```yaml
Artifact:

apps/api/src/execution-control/
execution-control.service.ts


Summary:

Controls execution authorization boundaries
between capability grants and runtime execution.
```

Darstellung:

```text
┌─────────────────────────────┐
│ execution-control.service.ts │
├─────────────────────────────┤
│ Authority Boundary           │
│ MAY semantic role            │
│ Grant validation             │
└─────────────────────────────┘
```

---

# Layer 2 — Semantic Layer

## Ziel

Einordnung nach AVGL Grammar.

Core:

```text
WHO
KNOW
THINK
CAN
MAY
ACT
DID
```

Mapping:

| AVGL | Bedeutung | Repository Mapping |
|-|-|-|
| WHO | Actor / Identity | Agents, Roles, Harness |
| KNOW | Context / Resources | Files, Memory, Docs, State |
| THINK | Reasoning | Models, Planning, Routing |
| CAN | Capability | Tools, APIs, Functions |
| MAY | Authority | Policies, Permissions, Grants |
| ACT | Effect Path | Executors, Actions |
| DID | Evidence | Receipts, Verification |



Beispiel:

Repository:

```text
apps/api/src/execution-control/
```

Semantic Mapping:

```yaml
semantic:

role:
  MAY

meaning:
  authority enforcement

evidence:

  grant validation

  tenant-agent binding

confidence:
  inferred
```

---

# Layer 3 — Context Layer (neu)

## Problem

Semantic Layer sagt:

```text
Diese Datei ist MAY.
```

Context Layer sagt:

```text
Warum existiert sie?
Wo befindet sie sich?
Was beeinflusst sie?
Welche Systemfunktion erfüllt sie?
```

---

## Context Object

Neue Struktur:

```yaml
AVGLContext:

artifact:

  path:
    apps/api/src/execution-control/service.ts


identity:

  component:
    Execution Control Service


domain:

  Runtime Governance


purpose:

  validates execution authority


semantic:

  primary:
    MAY

  related:

    CAN
    ACT


parents:

  - apps/api
  - runtime


children:

  - grant-validator
  - execution-handler


relations:

  consumes:
    CapabilityGrant

  protects:
    ExecutionBoundary

  produces:
    AuthorizationDecision
```

---

# Layer 4 — System Understanding Layer

## Ziel

Aus einzelnen Artefakten entsteht ein Systembild.

Nicht:

```text
Dateiliste
```

sondern:

```text
System Model
```

---

Beispiel:

```text
                WHO

             Agent
               |
               |
               v

              KNOW

          Context Layer
               |
               |
               v

              THINK

        Planning Engine
               |
               |
               v

              CAN

        Tool Capability
               |
               |
               v

              MAY

      Permission Boundary
               |
               |
               v

              ACT

       Execution Runtime
               |
               |
               v

              DID

       Verification Evidence
```

---

# 2. Repository Mapping

## Beispiel: Model-Agnostic Workflow System

## Root Structure

```text
repository
│
├── apps
│
├── packages
│
├── skills
│
├── .agents
│
├── .claude
│
├── .codex
│
└── architecture
```



# AVGL Interpretation

## Governance Surface

```text
.agents
.claude
.codex
```

Mapping:

```yaml
WHO:
 Agent Identity

KNOW:
 Instructions / Context

MAY:
 Execution Rules
```

Icon:

```
      ◉
     / \
    /___\
```

Meaning:

Agent boundary.

---

# Runtime Surface

```text
apps/api
```

Mapping:

```yaml
ACT:

execution services

CAN:

API capabilities

MAY:

execution control
```

---

# Intelligence Surface

```text
packages/llm
```

Mapping:

```yaml
THINK:

model routing

reasoning

provider abstraction
```

---

# Capability Surface

```text
skills/
tools/
```

Mapping:

```yaml
CAN:

available actions

external integrations
```

---

# Evidence Surface

```text
artifacts/
runtime-runs/
logs/
```

Mapping:

```yaml
DID:

verified outcomes
```

---

# 3. Iconography Integration

Icons ersetzen keine Semantik.

Sie sind eine zweite visuelle Syntax.

Prinzip:

```text
Text
 +
AVGL Syntax
 +
Icon Language
 =
System Understanding
```

---

# Icon Grammar

## Structure Icon

Bedeutung:

```text
Container
Hierarchy
Boundary
```

Darstellung:

```
┌─────┐
│ ┌─┐ │
│ │█│ │
│ └─┘ │
└─────┘
```

Verwendung:

- Folder
- Package
- Domain
- Layer



---

## Agent Icon

Bedeutung:

```text
Actor
Identity
Decision Entity
```

Verwendung:

WHO

---

## Propagation Icon

Bedeutung:

```text
Flow
Influence
Dependency
```

Verwendung:

Relations:

```text
A ─────> B
```

---

## Effective Icon

Bedeutung:

```text
Effect
Action
Runtime Impact
```

Verwendung:

ACT

---

## Evidence Icon

Bedeutung:

```text
Proof
Verification
Ground Truth
```

Verwendung:

DID

---

# 4. Relations Visual Syntax

## Dependency

```text
A
│
▼
B
```

Icon:

Propagation



---

## Inheritance

```text
Parent
  │
  ├── Child
  └── Child
```

Icon:

Structure + Layer



---

## Authority Flow

```text
Policy

  ↓ grants

Agent

  ↓ executes

Capability
```

Icon:

Authority + Effective



---

## Evidence Flow

```text
ACT

 ↓ produces

DID
```

Icon:

Effective → Evidence



---

# 5. Neue UI Darstellung

Aktuell:

```
WHO

245 evidence refs

file.ts:25
```

---

Neu:

```
┌─────────────────────────────┐
│ ◉ WHO                       │
│                             │
│ Agent Identity Layer        │
│                             │
│ Component: Loop Controller  │
│ Domain: Runtime Harness     │
│                             │
│ ┌───────┐                   │
│ │ WHO   │ Agent             │
│ └───────┘                   │
│                             │
│ Relations:                 │
│                             │
│ inherits → Harness          │
│ controls → Runtime          │
│ influences → ACT            │
│                             │
│ Evidence: 245 refs           │
└─────────────────────────────┘
```

---

# 6. Implementierungs-Scope

## Phase 1 — Context Object

Neue Datei:

```text
src/context/context-resolution.ts
```

Output:

```typescript
interface AVGLContext {

artifact

identity

semanticRole

domain

relations

parents

children

confidence

}
```



## Phase 2 — Context Resolver

Pipeline:

```text
Scanner

↓

Semantic Resolver

↓

Context Resolver

↓

Projection Engine

↓
UI
```

---

## Phase 3 — Icon Projection

Neue Mapping:

```yaml
WHO:
 agent-icon

KNOW:
 structure-icon

THINK:
 cognition-icon

CAN:
 capability-icon

MAY:
 authority-icon

ACT:
 effective-icon

DID:
 evidence-icon
```

---

# 7. Architekturentscheidung

AVGL bleibt bewusst:

```text
kein Wiki
kein Knowledge Graph Explorer
keine reine Graph Visualisierung
```

Sondern:

```text
Semantic Operating Map

+

Context Projection

+

Visual Grammar
```

Kurz:

```text
v0.2:
"Was ist das?"

v0.3:
"Was ist es, wo gehört es hin und welche Rolle spielt es?"

v0.4:
"Wie wirkt es tatsächlich im System?"
```

Damit bleibt die Trennung erhalten:

```text
Semantic Understanding
        ↓
Context Understanding
        ↓
Topology Reconstruction
```

und verhindert, dass AVGL bereits aus statischen Dateien eine falsche Runtime-Wahrheit ableitet.
````
