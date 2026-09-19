# AVGL Context Intelligence Layer — Dispositioned Input

**Status:** ARCHIVED INPUT — NON-CANONICAL — DISPOSITIONED (owner decision: ADOPT PARTIAL)
**Received:** 2026-09-19 (owner-pasted output of an external session; contains a residual `:chatgpt-content-reference` marker retained verbatim below as provenance evidence; not previously present in this repository)
**Routing:** owner message targeted this repository (`ziel repo: ~/projects/AVGL/*`; resolved locally to `projects/AVGL`).
**Disposition:** fourth dispositioned input of the 2026-09-19 series (after [AVGL_CONTEXTUAL_UNDERSTANDING_INPUT_2026-09-19.md](./AVGL_CONTEXTUAL_UNDERSTANDING_INPUT_2026-09-19.md), [AVGL_SEMANTIC_IR_STABILIZATION_INPUT_2026-09-19.md](./AVGL_SEMANTIC_IR_STABILIZATION_INPUT_2026-09-19.md), [AVGL_STRUCTURE_OPTIMIZATION_INPUT_2026-09-19.md](./AVGL_STRUCTURE_OPTIMIZATION_INPUT_2026-09-19.md)). Owner decision 2026-09-19 (second owner message, same day): **ADOPT PARTIAL** — semantic card confidence rendering adopted as an AVGL-0287 amendment; AVGL-0294/0295 created as deferred non-canonical design inputs; agent-as-resolver and new pipeline names rejected. Record below.
**Authority:** This document is input material only and creates no architecture authority. Architecture authority remains [`AVGL_SOURCE_OF_TRUTH.md`](../AVGL_SOURCE_OF_TRUTH.md); the active implementation path remains [`AVGL_IMPLEMENTATION_WORKING_PLAN.md`](../AVGL_IMPLEMENTATION_WORKING_PLAN.md).

## Disposition record (owner decision 2026-09-19: ADOPT PARTIAL)

| Input concept | Disposition | Grounding |
|---|---|---|
| Diagnosis "Cards connect Datei → semantische Klasse → Systemwirkung, Kontext fehlt" (intro) | COVERED — this exact gap was owner-adopted earlier today as the context lens plus context role card | Working plan AVGL-0277, AVGL-0287 (Revision 2026-09-19) |
| Semantic Card v2: ROLE / POSITION / RELATION / EFFECT / EVIDENCE / CONFIDENCE (input §3) | **ADOPTED (amendment to AVGL-0287):** card confidence rendering over the canonical evidence states EXPLICIT / INFERRED / OBSERVED / UNKNOWN — an evidence state, never a numeric score or model self-confidence. Reconciliation: the owner-proposed label DERIVED (deterministisch abgeleitet) maps to the existing derivation/provenance chain (AVGL-0261/0263); introducing DERIVED as a fifth canonical evidence state would require an explicit SoT §28 revision and was not adopted | AVGL-0287 (amended, Revision 2026-09-19 (4)); SoT §15; AVGL-0215 contract |
| WHO…DID file projection, "Datei als Systemobjekt" (input §5) | COVERED — agentic vocabulary projection over the IR already preserves this | SoT §11; plan AVGL-0273 |
| Context Memory Layer / Semantic Objects `{id, identity, relations, effects, evidence, inheritance, runtime_scope}` (input §6) | COVERED — this is the v0.2 IR itself (spaces, objects, identities, typed relations, effects, evidence, scope model), not a separate memory system; no second wiki-like store | SoT §9–§16; plan P3–P6 (AVGL-0210–0253) |
| "Structure = Effect" (input §2 Graph Agent rationale) | COVERED — already a canonical AVGL principle | SoT §13 |
| Agent Layer: File/Context/Graph agents producing `belongs_to`, `affects`, `changes_effect` (input §2, §4) | **REJECTED as resolver/authority** (owner decision: "Agent als Resolver | REJECT") — agents must not become the source of truth; the canonical resolution path is Repository Evidence → Deterministic Extraction → Semantic IR/Context Object → Agent-assisted Interpretation → Human Projection. The SoT §24 LLM-assist track (naming, summarization, explicitly-marked hypotheses) remains the only sanctioned interpretive role; private-source invariants apply | SoT §24; repo AGENTS.md "Deterministic baseline first" and "Private source invariants" |
| Service Worker as "Context Synchronization Runtime" (input §1, Phase 2) | **DEFERRED → AVGL-0294 design input** (owner reframed: Service Worker = Context Synchronization Layer, not an intelligence layer; may cache/synchronize/queue/trigger updates; may not decide semantics, produce relations, or interpret architecture). Factual correction: a service worker cannot observe local file-change events (browser sandbox); change detection belongs to the analyzer/watch side, the worker only consumes refresh results | [AVGL_0294_SERVICE_WORKER_CONTEXT_SYNC_RUNTIME_DESIGN_INPUT.md](./AVGL_0294_SERVICE_WORKER_CONTEXT_SYNC_RUNTIME_DESIGN_INPUT.md); SoT §19 |
| Agent Harness context packaging: agents receive Task Context + Relevant Files + AVGL Relations + Evidence Boundary (input Phase 3) | **DEFERRED → AVGL-0295 design input** (owner reframed: Context IR → Agent Context Package → Agent Task Execution; the agent receives an AVGL lens, not the repository) | [AVGL_0295_AGENT_CONTEXT_PACKAGE_CONTRACT_DESIGN_INPUT.md](./AVGL_0295_AGENT_CONTEXT_PACKAGE_CONTRACT_DESIGN_INPUT.md); SoT §8, §24 |
| Separate pipeline naming: Repository Scan → Semantic Extraction Agent → AVGL Resolver / Context Graph → Card Generator (input §4) | REJECTED — parallel pipeline naming; the canonical pipeline remains DISCOVER → EXTRACT → CLASSIFY → BIND → RELATE → RESOLVE → SYNTHESIZE → PROJECT; "Resolver"/"Graph" are IR/lens responsibilities, not new stages | SoT §18; identical rejection already recorded for the first input of the series |
| Views: Files View / System View / Agent View (input Phase 4) | COVERED — lens family plus spatial projection phases | Plan P7 (AVGL-0270–0277), P8 (AVGL-0280–0287) |
| "Laufende semantische Repräsentation eines Agentic Systems" (live representation, input Fazit) | DEFERRED — explicitly the deferred temporal/runtime direction; current step is architecture-first | SoT §17 |
| Phase 1 entities ContextObject / SemanticCard / EvidenceLink / RelationEdge (input Phase 1) | COVERED — IR object/identity/evidence/relation schema families already define these; the card is a projection, not a schema addition | AVGL-0210–0214; AVGL-0287 |
| Evidence-free assertions in examples (`affects`, `used_by`, `changes_effect` without evidence refs) (input §2 JSON examples) | REJECTED as written — every asserted relation/effect must be evidence-bound or explicitly UNKNOWN; agent output without evidence refs cannot populate these fields | SoT §15, §16; repo AGENTS.md "Evidence before interpretation" / "Unknown stays unknown" |

## Owner decision record (2026-09-19, second owner message)

Owner decision: **Input 4 — Disposition: ADOPT PARTIAL**, with:

| Thema | Entscheidung |
|-|-|
| Semantic Card Confidence | ADOPT |
| Service Worker Runtime | DEFER → AVGL-0294 |
| Agent Context Packaging | DEFER → AVGL-0295 |
| Agent als Resolver | REJECT |
| neue Pipeline-Namen | REJECT |
| Context Object / IR Erweiterung | bereits covered |

Owner-stated resolution direction (recorded verbatim in intent, reconciled to canonical vocabulary above):

```text
Repository Evidence
        ↓
Deterministic Extraction
        ↓
Semantic IR / Context Object
        ↓
Agent-assisted Interpretation
        ↓
Human Projection Card
```

Owner-stated guardrail (rejected inverse direction):

```text
LLM → creates graph → creates relations → creates truth    [PREVENTED]

LLM output ≠ system state

system state → evidence → semantic projection → LLM interpretation    [CANONICAL]
```

Next step per owner instruction: AVGL-0294 and AVGL-0295 were created as **non-canonical design inputs** (not working-plan tickets, no implementation); their activation is a separate future owner decision.

### Owner confirmation and AVGL-0296 order (2026-09-19, third owner message)

Owner confirmed the final decision state:

```text
Input 4 — ADOPT PARTIAL

AVGL-0287 ── ADOPTED
AVGL-0294 ── DEFERRED DESIGN INPUT
AVGL-0295 ── DEFERRED DESIGN INPUT
```

Evidence state vs. derivation mechanism (owner-final; resolves the flagged SoT §28 question — no revision):

- Canonical evidence states remain EXPLICIT / OBSERVED / INFERRED / UNKNOWN. `DERIVED` describes **not the state of an evidence** but the mechanism by which a claim came to exist; it stays a derivation attribute, never a state.
- Target claim structure (owner-provided, recorded verbatim; consistent with the AVGL-0215 provenance contract):

```yaml
claim:
  value: "executor depends on policy layer"

  evidence_state:
    OBSERVED

  derivation:
    resolver:
      relation-resolver.v1

    method:
      import_graph

    sources:
      - executor.ts
      - policy.ts
```

- Separation invariant: `State + Provenance + Derivation` remain distinct fields.

Next design slice ordered by owner (created as non-canonical design input, no activation of 0294/0295): **AVGL-0296 Context Projection Contract** — the governance layer answering "Welche Teile des Semantic IR dürfen in welches Agent Context Package projiziert werden?" via a projection policy (visible objects, visible relations, evidence boundary, inherited constraints). Resulting owner-ordered chain:

```text
0287 Evidence Projection → 0296 Context Projection Contract → 0295 Agent Context Package → 0294 Runtime Synchronization
```

See [AVGL_0296_CONTEXT_PROJECTION_CONTRACT_DESIGN_INPUT.md](./AVGL_0296_CONTEXT_PROJECTION_CONTRACT_DESIGN_INPUT.md).

Notes:

- No Source of Truth decision changed by this adoption. The DERIVED question is owner-final: DERIVED is a derivation mechanism, not an evidence state; no SoT §28 revision.
- No detector, schema, or renderer change is part of this disposition; implementation of the AVGL-0287 confidence amendment happens when P8 is reached. `npm test` and `npm run check` are unaffected (docs-only).
- The residual `:chatgpt-content-reference{index="0"}` marker is retained verbatim below; it documents external generation and reinforces non-canonical status.
- The claimed screenshot ("Die gezeigte Oberfläche") was not part of the received material; only the text arrived. Card-related claims from it are treated as unevidenced input narrative.

## Original input (verbatim, archived)

````markdown
## Analyse des Screenshots / aktueller AVGL-Ansatz

Die gezeigte Oberfläche bestätigt die Richtung: AVGL ist aktuell bereits mehr als ein Repository-Explorer. Die Cards versuchen drei Ebenen zu verbinden:

```text
Datei
 ↓
semantische Klasse
 ↓
mögliche Systemwirkung
```

Beispiel aus dem Screenshot:

```text
docs/ARCHITECTURE_FOUNDATION.md

→ Datei vorhanden

→ Kontext fehlt aktuell

→ "Wie ist es verbunden?"
→ "Was bewirkt es?"
```

Genau diese Lücke sollte ein **Context Resolution Layer** schließen.

Der Fehler ist nicht die Card selbst. Die Card braucht eine intelligente Kontextpipeline.

---

# Zielbild: AVGL Context Intelligence Layer

Nicht:

```text
File
 ↓
LLM Summary
 ↓
Card
```

sondern:

```text
Repository
      |
      v
Semantic Extraction Layer
      |
      v
Context Graph
      |
      v
Agent Resolver
      |
      v
AVGL Card Projection
```

---

# Architekturvorschlag

## 1. Service Worker als lokale Analyse-Schicht

Der Service Worker sollte nicht "denken".

Er ist der lokale Runtime-Orchestrator zwischen UI und Analyse-Backend. Service Worker eignen sich dafür, weil sie als ereignisbasierte Zwischenebene zwischen App, Requests und Datenquellen arbeiten können. :chatgpt-content-reference{index="0"}

Aufgabe:

```text
AVGL UI
 |
 |
Service Worker
 |
 +-- Cache
 |
 +-- Context Queue
 |
 +-- Agent Requests
 |
 +-- Semantic Updates
```

Verantwortung:

- lokale Cachehaltung
- inkrementelle Updates
- File-Change Events
- Background Context Refresh
- Offlinefähigkeit
- Agent Task Queue

Nicht:

- eigene Semantik
- Entscheidungen
- Klassifikation

---

# 2. Agent Layer

Darüber:

```text
          Agent Runtime

              |
    +---------+---------+
    |         |         |
 File Agent Context Agent Graph Agent
```

## File Understanding Agent

Aufgabe:

"Was ist diese Datei?"

Output:

```json
{
 "file": "ARCHITECTURE_FOUNDATION.md",

 "identity": {
   "type": "architecture_document",
   "role": "foundation"
 },

 "contains": [
   "contracts",
   "invariants",
   "decisions"
 ],

 "affects": [
   "runtime",
   "governance",
   "agents"
 ]
}
```

---

## Context Agent

Die zentrale Komponente.

Nicht:

"Beschreibe diese Datei"

sondern:

"Ordne diese Datei in das System ein"

Output:

```json
{
 "belongs_to": [
   "architecture layer",
   "governance layer"
 ],

 "depends_on": [
   "ADR-001",
   "QML contracts"
 ],

 "used_by": [
   "agents",
   "runtime",
   "CI"
 ],

 "changes_effect": [
   "system behavior",
   "developer workflow"
 ]
}
```

---

## Graph Agent

Erzeugt die AVGL-Struktur:

```text
ARCHITECTURE_FOUNDATION.md

        |
        |
        +------ ADR-001
        |
        +------ QML Contract
        |
        +------ Runtime Boundary
        |
        +------ Agent Harness
```

Nicht als reiner Graph.

Sondern:

```text
Structure = Effect
```

entsprechend deiner AVGL-Definition.

---

# 3. Neue Card-Struktur

Aktuelle Card:

```text
WHO

Wer handelt?

256 / 347 evidence refs
```

Erweitern zu:

---

## AVGL Semantic Card v2

```
+--------------------------------+

ICON

SEMANTIC CLASS

ARCHITECTURE FOUNDATION

---------------------------------

ROLE

Was ist es?

"Canonical architecture contract"

---------------------------------

POSITION

Wo befindet es sich?

docs/
architecture layer

---------------------------------

RELATION

Womit verbunden?

ADR-001
Runtime
Governance

---------------------------------

EFFECT

Was verändert es?

Defines system boundaries

---------------------------------

EVIDENCE

Warum glauben wir das?

source refs

---------------------------------

CONFIDENCE

Observed / Inferred

+--------------------------------+
```

---

# 4. Agent Pipeline

```text
Repository Scan

        |
        v

File Inventory

        |
        v

Semantic Extraction Agent

        |
        +----------------+
        |                |
        v                v

AVGL Resolver       Context Graph

        |
        v

Card Generator

        |
        v

Human Projection
```

---

# 5. Verbindung zu WHO → DID

Die Cards sollten direkt die AVGL Grammatik spiegeln:

Beispiel:

## Datei

```text
src/runtime/executor.ts
```

wird nicht beschrieben als:

> "contains executor functions"

sondern:

```text
WHO

Runtime Executor Agent

KNOW

Uses execution context

CAN

Provides execution capability

MAY

Requires authority binding

ACT

Creates effect path

DID

Produces execution evidence
```

Damit wird die Datei ein **Systemobjekt**, nicht ein Dokument.

---

# 6. Context Memory Layer

Nicht klassische LLM-Wiki-Struktur.

Kein:

```
folder
 |
 markdown
 |
 summary
```

Sondern:

```
Semantic Object

{
 id,
 identity,
 relations,
 effects,
 evidence,
 inheritance,
 runtime_scope
}
```

Beispiel:

```json
{
"id":"architecture.foundation",

"extends":[
 "governance.contract"
],

"influences":[
 "runtime",
 "agents"
],

"effect":{
 "type":"boundary_definition"
}
}
```

---

# 7. Priorisierte Implementierung

## Phase 1 — Context Cards

Einführen:

```
ContextObject
SemanticCard
EvidenceLink
RelationEdge
```

---

## Phase 2 — Background Worker

Service Worker:

```
file changed
    |
    v
queue analysis
    |
    v
agent refresh
    |
    v
card update
```

---

## Phase 3 — Agent Harness

Agents bekommen:

```text
Task Context

+
Relevant Files

+
AVGL Relations

+
Evidence Boundary
```

Nicht komplettes Repository.

---

## Phase 4 — Projection

Views:

```
Files View
   |
   + semantic cards


System View
   |
   + runtime graph


Agent View
   |
   + harness relationships
```

---

# Fazit

Das eigentliche nächste Architekturlevel für AVGL ist nicht "mehr Graph".

Es ist:

```text
Repository
        ↓
Semantic Objects
        ↓
Relations
        ↓
Effects
        ↓
Human-readable Cards
```

Der Service Worker wäre dabei die **Context Synchronization Runtime**.

Die Agenten wären die **Semantic Resolution Layer**.

Die Cards wären die **Human Projection Layer**.

Damit wird AVGL kein Obsidian-ähnliches Wissenssystem, sondern eine **laufende semantische Repräsentation eines Agentic Systems**.
````
