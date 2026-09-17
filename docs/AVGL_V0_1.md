# AVGL v0.1 — Concept

AVGL (Agent Visual Grammar Language) is a human-first language for understanding agent systems without starting from a graph of implementation details.

## Core semantic spine

```text
WHO → KNOW → THINK → CAN → MAY → ACT → DID
```

The visible product language may be simpler, but these seven classes remain the internal semantic backbone.

- **WHO** — identity, role, harness, objective
- **KNOW** — context, memory, sources, resources
- **THINK** — model, planning, reasoning, subagents
- **CAN** — tools, adapters, APIs, technical reach
- **MAY** — policy, scope, approval, grants, revocation
- **ACT** — execution and real-world effects
- **DID** — evidence, receipts, verification, outcomes

## Human-first rule

> Show the story, not the graph.

A user should not need to learn AVGL before understanding an AVGL projection.

The default projection asks:

```text
Wer arbeitet hier?
↓
Womit arbeitet das System?
↓
Wie denkt oder plant es?
↓
Was kann es technisch?
+
Was darf es?
↓
Was kann reale Wirkung erzeugen?
↓
Wie wird das Ergebnis nachgewiesen?
```

## Compiler pipeline

```text
Repository / Framework / Runtime Trace
              ↓
          DISCOVER
              ↓
          CLASSIFY
              ↓
            BIND
              ↓
            AVGL IR
              ↓
           PROJECT
      ┌───────┼────────┐
    STORY    CARD    SYSTEM
```

### DISCOVER

Collect deterministic structural evidence from repositories and, later, framework adapters and runtime traces.

### CLASSIFY

Map evidence to candidate AVGL semantics. Classification is not authority and must remain distinguishable from observed runtime behavior.

### BIND

Bind every semantic claim to source evidence. Missing semantics remain `UNKNOWN`; they are not silently inferred from adjacent classes.

### PROJECT

Generate progressively understandable views. The v0.1 kernel begins with Story, Harness Card, and JSON IR projections.

## Required invariants

```text
HARNESS != AUTHORITY
CONTEXT != PERMISSION
CAN != MAY
PROPOSAL != EXECUTION
ACT != DID
RECEIPT != VERIFICATION
```

The most important rule is `CAN != MAY`: finding a tool or API proves technical reach, not permission to use it for a concrete effect.

## Evidence states

- `EXPLICIT` — directly declared by a source contract or configuration
- `INFERRED` — derived from structural/code evidence
- `OBSERVED` — seen in an actual runtime trace
- `UNKNOWN` — not sufficiently supported

The deterministic v0.1 repository scanner intentionally emits `INFERRED` claims. Framework-specific adapters can later upgrade evidence quality when they have stronger source contracts. Runtime traces can add `OBSERVED` evidence.

## v0.1 boundary

Included now:

- dependency-free repository scanning;
- bounded text-file inspection;
- common secret-file exclusion;
- deterministic semantic detectors;
- evidence-bound AVGL IR;
- explicit unknowns;
- Story / Harness Card / JSON projection;
- tests for `CAN != MAY` and secret exclusion.

Not yet included:

- AST-level language adapters;
- framework-specific adapters;
- LLM semantic classification;
- runtime tracing;
- relation/call-graph reconstruction;
- interactive visualization.

Those additions must extend the IR rather than replace the evidence-bound baseline.
