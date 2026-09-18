# AVGL SOURCE OF TRUTH

**Status:** Normative architecture baseline  
**Scope:** Architecture-first AVGL, target IR v0.2 and compatible future evolution  
**Repository:** baum777/AVGL  
**Established:** 2026-09-18

> **Precedence:** This document is the authoritative product and architecture definition for AVGL. If older v0.1 documentation, README wording, implementation details, or comments conflict with this document, this document wins unless it is explicitly superseded by a later owner-approved Source of Truth revision.

---

## 1. Canonical definition

**Agent Visual Grammar Language (AVGL) is a machine-readable visual system grammar for structurally representing, understanding, and navigating complex agentic systems.**

AVGL exists to make systems composed of repositories, folders, files, context, workflows, data flows, agents, harnesses, runtimes, policies, tools, and derived effects readable as one coherent system rather than as a flat graph or a collection of disconnected implementation artifacts.

AVGL is not primarily a graph viewer. It is not an Obsidian-brain variant, an LLM wiki, or a repository map with prettier nodes and edges.

~~~text
many repositories / folders / files
+ context and instruction layers
+ workflow and data-flow logic
+ agents / harnesses / runtime
+ inheritance / overrides / derivation
+ downstream effects
─────────────────────────────────────
one coherent structural system model
─────────────────────────────────────
SEE = UNDERSTAND = NAVIGATE
~~~

---

## 2. Intent priorities

The intent-sync session fixed the product priority as:

~~~text
Universal Agent Interaction Language
>
Machine-readable / generative grammar
>
Visual system language = Semantic visual language
>
Governance-specific language
~~~

Shorthand:

~~~text
E > C > A = B > D
~~~

Consequences:

1. AVGL must remain broader than a governance notation.
2. Governance is a vocabulary/lens inside AVGL, not the universal AVGL kernel.
3. Visual representation must have a machine-readable semantic counterpart.
4. Human comprehension is mandatory, but the model cannot be only presentation.
5. The architecture must support future bidirectional and authoritative use.

---

## 3. Explicit non-goals

AVGL must not collapse into:

- a generic node-edge graph explorer;
- an Obsidian-style knowledge graph;
- an LLM-generated wiki of repository contents;
- a file tree with semantic badges;
- a static architecture diagram format;
- a governance-only notation;
- a visual wrapper around unstructured model summaries;
- a visual IDE whose primary purpose is direct code editing;
- a renderer where layout is decorative and carries no structural meaning.

A graph may be one local projection of relationships. It is never the complete AVGL representation model.

---

## 4. Primary representation model

Representation priority:

~~~text
LAYERED PROJECTION
>
SPATIAL ARCHITECTURE
>
MULTISCALE SYSTEM MAP
>
FIXED STRUCTURAL ONTOLOGY
~~~

Shorthand:

~~~text
C > A > B > D
~~~

AVGL models one underlying system and permits several coherent projections over it.

~~~text
                         SYSTEM MODEL
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
      STRUCTURE             LOGIC              CONTEXT
          │                   │                   │
          ├──────────┬────────┼────────┬──────────┤
          ▼          ▼        ▼        ▼          ▼
        DATA       RUNTIME   EFFECT   FILES    WORKFLOW
~~~

A projection changes emphasis. It must not invent a different underlying truth.

---

## 5. Fixed dimensions and dynamic lenses

### 5.1 Canonical dimensions

AVGL must support at least:

- **STRUCTURE** — repositories, spaces, folders, files, modules, containment;
- **LOGIC** — workflows, decisions, ordering, branching, transformations;
- **CONTEXT** — instructions, prompts, memory, knowledge, resource context;
- **DATA** — inputs, outputs, reads, writes, transforms, persistence;
- **RUNTIME** — harnesses, processes, models, tools, execution surfaces;
- **AUTHORITY** — permissions, policy, approval, grants, revocation, boundaries.

These are not exclusive types. One object may participate in several dimensions at once.

### 5.2 Lenses

A lens is a deterministic projection rule over the same system model.

Initial lens families:

- Architecture;
- Structure;
- Agentic / Narrative;
- Evidence;
- Context;
- Dependency;
- Inheritance;
- Propagation;
- Effective State;
- Authority / Governance;
- Impact;
- Runtime, later in the architecture-first line.

Formal rule:

~~~text
SYSTEM MODEL + LENS = PROJECTION
~~~

A lens must not silently upgrade evidence strength or create unsupported relations.

---

## 6. Human interaction priority

The primary interaction priority is:

~~~text
SEE = UNDERSTAND = NAVIGATE
>
QUERY = DEBUG = CHANGE
~~~

Shorthand:

~~~text
1 = 2 = 5 > 3 = 4 = 6
~~~

### See

Answer: **What exists?**

The user can perceive meaningful spaces, boundaries, objects, identities, and relationships.

### Understand

Answer: **How does it work and what does it affect?**

The user can understand scope, dependency, inheritance, derivation, resolution, and downstream effect.

### Navigate

Navigation is an operation on the system model, not merely scrolling or opening a file.

~~~text
file
→ symbol
→ consumer
→ agent
→ workflow
→ runtime surface
→ artifact
~~~

or:

~~~text
effective behavior
→ contributing config
→ inherited policy
→ source artifact
~~~

Navigation must support following typed relations in both provenance/source and downstream/effect directions.

---

## 7. Graduated interaction model

Canonical progression:

~~~text
OBSERVE
   ↓
EXPLORE
   ↓
NAVIGATE
   ↓
QUERY
   ↓
SIMULATE
   ↓
PROPOSE
   ↓
APPLY
~~~

For the architecture-first implementation, the primary product obligation is:

~~~text
OBSERVE + EXPLORE + NAVIGATE
~~~

Query, debugging, simulation, proposal, and apply are secondary layers that build on the same model.

---

## 8. Source-of-truth evolution

AVGL is designed to evolve through three authority stages.

### Stage 1 — Projection

~~~text
repository / config / framework
              ↓
             AVGL
~~~

The external system is authoritative. AVGL reads and projects it.

### Stage 2 — Bidirectional representation

~~~text
SYSTEM ⇄ AVGL
~~~

AVGL can express change intent and round-trip selected structures without being the only authority.

### Stage 3 — AVGL as source of truth

AVGL may eventually become an authoritative, serializable system description from which implementation or configuration can be generated or reconciled.

This future requirement affects present design: core structures must be explicit and serializable rather than encoded only in layout, prose, or renderer state.

---

## 9. Universal kernel

The universal AVGL kernel is **not** WHO → KNOW → THINK → CAN → MAY → ACT → DID.

The canonical kernel is:

~~~text
OBJECT
SPACE
BOUNDARY
RELATION
FLOW
STATE
TRANSFORMATION
IDENTITY
~~~

These are semantic primitives, not necessarily one-to-one visual glyphs.

### Object

A represented thing: file, agent, tool, workflow, prompt, config, runtime component, artifact, or another typed entity.

### Space

A structural region in which objects exist or rules apply: repository, folder subtree, package, runtime, external system.

### Boundary

A meaningful separation or scope edge: repository border, runtime border, authority border, trust boundary, or vocabulary-specific containment.

### Relation

A typed, evidence-bound relationship between represented subjects.

### Flow

Movement of data, intent, context, control, work, or effect through the system.

### State

A declared, derived, resolved, effective, or observed condition of an object or system region.

### Transformation

A semantic operation that changes input into output or one state into another.

### Identity

A semantic role or interpretation an object has within a vocabulary and scope.

---

## 10. Typed vocabularies

Domain concepts are expressed through vocabularies layered on the universal kernel.

Initial vocabulary families:

~~~text
filesystem
repository
agentic
context
workflow
data
runtime
governance
evidence
~~~

Framework-specific concepts are adapter inputs. They are not universal AVGL truth.

---

## 11. The current seven-class model

The existing semantic spine remains valuable:

~~~text
WHO → KNOW → THINK → CAN → MAY → ACT → DID
~~~

It is reclassified as an **Agentic / Governance vocabulary and projection**, not the universal kernel.

Canonical meanings remain:

- **WHO** — identity, role, harness, objective;
- **KNOW** — context, memory, sources, resources;
- **THINK** — model, planning, reasoning, subagents;
- **CAN** — tools, adapters, APIs, technical reach;
- **MAY** — policy, scope, approval, grants, revocation;
- **ACT** — execution and real-world effect paths;
- **DID** — evidence, receipts, verification, outcomes.

Existing semantic invariants remain binding.

---

## 12. Multi-identity model

AVGL explicitly rejects a single-identity assumption.

One concrete artifact may simultaneously hold several semantic identities.

~~~text
AGENTS.md
│
├── filesystem:file
├── context:instruction-source
├── governance:policy-source
├── scope:repository-default
└── runtime:context-contributor
~~~

The same artifact may have different effects across file, folder, repository, cross-repository, workflow, or runtime scopes.

~~~text
one artifact
→ multiple identities
→ multiple scopes
→ multiple effects
~~~

Identity is not equivalent to duplication. Projections may render one artifact differently according to lens while retaining stable underlying references.

---

## 13. Structure equals effect

This is a canonical AVGL principle:

~~~text
STRUCTURE = EFFECT
~~~

Structure must not be modeled as inert topology with an optional effect overlay.

A structurally complete representation must support both:

- **Where is this?**
- **What does this govern, influence, inherit, override, derive, or affect?**

A file is not completely described by its location if it acts as an inherited instruction source for an entire subtree.

The system must model at least four complementary directions:

### Source / provenance

Where did this effective property come from?

### Inheritance / precedence

What is inherited, overridden, shadowed, extended, or composed?

### Resolution

What is actually effective at this object or scope?

### Propagation / impact

What downstream structures or behaviors can this affect?

---

## 14. Relation grammar

Relations must be typed. They must not collapse into a generic edge.

### Structural

- contains
- belongs_to
- defines
- references

### Dependency

- imports
- depends_on
- reads
- writes
- calls

### Scope / inheritance

- applies_to
- inherits
- overrides
- shadows
- extends

### Derivation / composition

- derives
- resolves_to
- contributes_to
- composes_with

### Runtime

- instantiates
- invokes
- executes_as
- dispatches_to

### Effect

- affects
- propagates_to
- mutates
- produces
- verifies

This list is extensible. Every new relation type must define semantics, evidence requirements, directionality, scope behavior, and projection behavior.

---

## 15. Evidence is orthogonal to structure

AVGL retains the existing evidence discipline.

Canonical evidence states:

- **EXPLICIT**
- **INFERRED**
- **OBSERVED**
- **UNKNOWN**

Evidence is not a structural primitive and semantic meaning is not evidence.

Instead:

~~~text
every asserted
OBJECT / IDENTITY / RELATION / FLOW / STATE / EFFECT
must be traceable to evidence
or explicitly remain UNKNOWN
~~~

Evidence may reference file/line/snippet, a framework contract, a machine-readable manifest, a runtime observation, or another bounded adapter source.

A stronger downstream synthesis must never revive evidence rejected by an earlier gate.

---

## 16. Binding invariants

Existing invariants remain binding:

~~~text
HARNESS != AUTHORITY
CONTEXT != PERMISSION
CAN != MAY
PROPOSAL != EXECUTION
ACT != DID
RECEIPT != VERIFICATION
~~~

Additional structural invariants:

~~~text
LOCATION != EFFECT
CONTAINMENT != INHERITANCE
REFERENCE != DEPENDENCY
DEPENDENCY != EXECUTION
DECLARED != EFFECTIVE
INHERITED != OVERRIDDEN
RELATION != ASSUMPTION
PROJECTION != SOURCE OF TRUTH
~~~

No call path or relationship may be inferred merely because two findings occur in the same file.

Unknown must remain unknown.

---

## 17. Architecture-first temporal boundary

To minimize complexity, the current primary scope is **architecture first**.

AVGL v0.2 must primarily answer:

~~~text
WHAT EXISTS?
WHERE DOES IT EXIST?
HOW DOES IT RELATE?
WHAT DOES IT AFFECT?
WHAT DOES IT INHERIT?
WHAT OVERRIDES IT?
WHAT BECOMES EFFECTIVE?
~~~

Time is intentionally not a first-class kernel primitive in this implementation step.

### Deferred temporal extension

The later direction is explicitly retained as:

~~~text
TIME = FIRST-CLASS PRIMITIVE
~~~

and ultimately:

~~~text
AVGL = TEMPORAL SYSTEM MAP
~~~

Future temporal AVGL may combine:

- execution history;
- system evolution / revision history;
- state transitions.

The temporal model must extend the architecture-first IR rather than invalidate it.

---

## 18. Compiler architecture

The current compiler baseline is valid but must be extended.

Current:

~~~text
DISCOVER
→ CLASSIFY
→ BIND
→ SYNTHESIZE
→ PROJECT
~~~

Target architecture-first compiler:

~~~text
DISCOVER
   ↓
EXTRACT
   ├─ objects
   ├─ spaces
   ├─ boundaries
   ├─ identities
   ├─ candidate relations
   └─ evidence
   ↓
CLASSIFY
   └─ typed vocabularies
   ↓
BIND
   └─ evidence binding
   ↓
RELATE
   └─ evidence-bound typed relations
   ↓
RESOLVE
   ├─ scope
   ├─ inheritance
   ├─ override / shadowing
   ├─ composition
   └─ effective state
   ↓
SYNTHESIZE
   ↓
PROJECT
~~~

The deterministic baseline remains mandatory.

---

## 19. Canonical IR direction

The target IR must be able to represent:

~~~text
sources
spaces
objects
identities
boundaries
relations
flows
states
transformations
derivations
effectiveStates
evidence
vocabularies
synthesis
invariants
~~~

The exact v0.2 JSON Schema is an implementation artifact and may evolve, but it must preserve the distinctions defined here.

The existing v0.1 nodes representation must not remain the only universal object model.

---

## 20. Projection rules

Required principle:

~~~text
ONE IR → MANY VIEWS
~~~

No renderer may maintain an independent semantic truth that is absent from the IR.

The existing views map forward as:

- **Files** → Structure lens;
- **Story** → Agentic / Narrative lens;
- **Inspect** → Evidence lens;
- **System** → Agentic / Governance lens.

The current fixed WHO/KNOW/THINK → CAN/MAY → ACT → DID System view must not be treated as universal system topology.

---

## 21. Spatial semantics

Spatial layout is meaningful but subordinate to the semantic model.

Position, containment, adjacency, nesting, boundary, and scale may encode structure. However:

1. semantics must survive a different renderer;
2. layout must never be the only storage location for a relation;
3. visual proximity alone must not create a semantic relation;
4. a spatial projection must remain derivable from machine-readable facts.

---

## 22. Navigation grammar

Navigation follows typed semantic structure.

Minimum navigation operations:

- enter / exit a space;
- follow relation forward;
- follow relation backward;
- trace provenance;
- trace propagation;
- inspect inheritance chain;
- inspect override chain;
- inspect effective-state contributors;
- jump from semantic object to source evidence;
- return from evidence to semantic object;
- switch lens without losing the selected underlying object/identity.

Navigation must preserve object identity across projections.

---

## 23. Human-first rendering principle

The established principle remains:

> **Show the story, not the graph.**

For the new architecture this means:

- do not expose raw topology by default;
- use structure, grouping, boundaries, paths, and progressive disclosure;
- show graph edges only when they are the clearest local representation;
- prioritize structural comprehension over node density;
- users should obtain value before learning AVGL notation.

---

## 24. Determinism and LLM boundary

The deterministic baseline remains authoritative for structural extraction and evidence binding.

LLMs may later assist with:

- naming;
- summarization;
- optional semantic classification;
- question answering;
- suggested lenses;
- change intent.

LLMs must not silently invent:

- objects;
- relations;
- inheritance;
- permission;
- execution;
- effective state;
- observed outcomes.

An LLM-produced structural hypothesis must remain explicitly distinguishable from verified or deterministically inferred model facts.

---

## 25. Security and scan boundaries

Existing default-deny scanning rules remain required.

Common credential/secret surfaces must not be read merely to improve completeness.

Skipped, unsupported, oversized, inaccessible, or intentionally excluded surfaces must remain visible as coverage limitations.

Complete repository topology does not imply complete semantic coverage.

---

## 26. Compatibility policy

The current v0.1 implementation is a valid baseline and must be migrated rather than discarded.

Preserve where possible:

- repository discovery;
- GitHub full-tree recovery;
- source coverage accounting;
- secret exclusions;
- evidence states;
- evidence references;
- semantic gates;
- deterministic synthesis;
- explicit unknowns;
- WHO…DID as an agentic vocabulary;
- CLI/API/Web frontdoors;
- current tests unless superseded by stronger equivalents.

Compatibility must never force the v0.2 IR to preserve an incorrect universal abstraction.

---

## 27. Architecture-first success condition

AVGL satisfies this Source of Truth when a user can take a complex system and, without relying on a flat graph, reliably:

1. see meaningful spaces and objects;
2. understand that one artifact may hold multiple identities;
3. distinguish containment from dependency, inheritance, override, derivation, and effect;
4. trace where an effective property came from;
5. trace what a source artifact can affect;
6. navigate across files/folders/repositories/agentic layers without losing identity;
7. inspect evidence for every asserted structural or semantic claim;
8. switch lenses over one coherent model;
9. preserve UNKNOWN wherever evidence is insufficient.

The implementation is incomplete if it merely renders the existing WHO…DID classes more attractively.

---

## 28. Frozen decision record from the intent-sync session

~~~text
Product priority:
E > C > A = B > D

Representation:
C > A > B > D

Projection strategy:
fixed dimensions + dynamic lenses

Human interaction:
SEE = UNDERSTAND = NAVIGATE
>
QUERY = DEBUG = CHANGE

Interaction model:
graduated
OBSERVE → EXPLORE → NAVIGATE → QUERY → SIMULATE → PROPOSE → APPLY

Authority evolution:
external system SoT
→ bidirectional
→ AVGL may eventually become SoT

Kernel:
universal kernel + typed vocabularies

Identity:
multiple identities per artifact/object

Core structural rule:
STRUCTURE = EFFECT

Temporal scope:
architecture-first now
time as first-class / temporal system map later
~~~

Changes to these decisions require an explicit Source of Truth revision rather than an incidental implementation change.
