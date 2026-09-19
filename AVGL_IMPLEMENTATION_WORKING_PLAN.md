# AVGL IMPLEMENTATION WORKING PLAN

**Status:** Active implementation plan  
**Target:** Architecture-first AVGL IR v0.2  
**Normative source:** [AVGL_SOURCE_OF_TRUTH.md](./AVGL_SOURCE_OF_TRUTH.md)  
**Baseline:** AVGL v0.1 evidence-bound repository analyzer  
**Out of scope:** first-class temporal model, full runtime-history ingestion, AVGL-authoritative code generation

**Revision 2026-09-19:** Owner-adopted context-lens framing from dispositioned external input; adds AVGL-0277 and AVGL-0287 (see [docs/AVGL_CONTEXTUAL_UNDERSTANDING_INPUT_2026-09-19.md](./docs/AVGL_CONTEXTUAL_UNDERSTANDING_INPUT_2026-09-19.md)). No Source of Truth decision changed.

**Revision 2026-09-19 (2):** Owner-adopted semantic-claims contract stabilization from a second dispositioned input of the same series; adds AVGL-0215 as a prerequisite for AVGL-0277/AVGL-0287 (see [docs/AVGL_SEMANTIC_IR_STABILIZATION_INPUT_2026-09-19.md](./docs/AVGL_SEMANTIC_IR_STABILIZATION_INPUT_2026-09-19.md)). No Source of Truth decision changed.

---

## 1. Objective

Move AVGL from the current semantic analyzer:

~~~text
repository
→ DISCOVER
→ CLASSIFY
→ BIND
→ WHO/KNOW/THINK/CAN/MAY/ACT/DID
→ STORY / INSPECT / SYSTEM
~~~

to an architecture-first structural compiler:

~~~text
sources
→ DISCOVER
→ EXTRACT
→ CLASSIFY
→ BIND
→ RELATE
→ RESOLVE
→ SYNTHESIZE
→ PROJECT
~~~

with one evidence-bound IR capable of representing:

~~~text
spaces
objects
identities
boundaries
typed relations
flows
states
transformations
derivations
effective state
vocabularies
evidence
lenses / projections
~~~

The implementation must preserve the current deterministic baseline and evidence invariants.

---

## 2. Global Definition of Done

The run is complete only when:

- [ ] schema/avgl-ir-v0.2.json exists and validates representative fixtures.
- [ ] Repositories, folders, and files are materialized in IR rather than existing only in the Web file tree.
- [ ] One artifact can carry multiple typed identities.
- [ ] Relations are typed, evidence-bound, and schema-validated.
- [ ] Containment is distinguishable from dependency.
- [ ] Inheritance is distinguishable from containment.
- [ ] Override/shadowing is modeled explicitly.
- [ ] Effective state resolves for the initial supported scope/inheritance fixtures.
- [ ] Provenance and downstream propagation are traversable.
- [ ] WHO…DID remains available as an Agentic vocabulary/projection.
- [ ] CAN != MAY, ACT != DID, secret exclusion, and explicit UNKNOWN behavior remain tested.
- [ ] Structure, Evidence, Agentic, Inheritance, Propagation, and Effective-State projections derive from the same IR.
- [ ] Web navigation can move structure → identity → relation/effect → evidence and back.
- [ ] Selected underlying object identity survives supported lens switches.
- [ ] No renderer-specific state becomes independent semantic truth.
- [ ] Full-scan reporting remains fail-closed on unreadable eligible files.
- [ ] npm test passes.
- [ ] npm run check passes.
- [ ] Public docs match implementation.
- [ ] The shipped result cannot reasonably be described as only a prettier repository graph.

---

## 3. Non-goals for this run

Do not expand this run into:

- first-class time as an AVGL primitive;
- execution-history playback;
- Git-history temporal navigation;
- arbitrary framework support;
- perfect cross-language AST extraction;
- direct visual code mutation;
- AVGL as authoritative source of truth;
- autonomous Apply operations;
- unrestricted LLM-generated topology;
- complete call-graph reconstruction for every language.

The architecture must leave seams for these later capabilities without implementing them now.

---

# PHASE 0 — Baseline lock and guardrails

## Purpose

Freeze behavior that must survive v0.2.

## Tickets

### AVGL-0200 — Baseline fixture inventory

- [ ] Catalog current tests by invariant.
- [ ] Ensure explicit coverage for secret exclusion.
- [ ] Ensure explicit coverage for incomplete scan.
- [ ] Ensure explicit coverage for CAN != MAY.
- [ ] Ensure documentation-only sources cannot prove MAY/ACT/DID.
- [ ] Ensure synthesis behavior remains deterministic.
- [ ] Ensure GitHub full-tree truncation fallback remains covered.
- [ ] Add a nested architecture fixture with root/nested AGENTS.md, config, agent implementation, workflow, and tool surface.

### AVGL-0201 — Compatibility contract

- [ ] Document retained v0.1 public exports.
- [ ] Define the v0.1 → v0.2 compatibility adapter boundary.
- [ ] Decide how analyzeRepository() exposes v0.2 while preserving legacy projections.
- [ ] Prevent silent CLI contract breaks.

## Gate P0

Migration starts only when current invariants have direct test coverage.

## DoD P0

- [ ] Baseline tests PASS.
- [ ] Architecture fixture committed.
- [ ] Compatibility expectations documented.
- [ ] No target-v0.2 semantic behavior hidden inside baseline work.

---

# PHASE 1 — IR v0.2 contract

## Purpose

Define the machine contract before renderer or extraction changes.

## Tickets

### AVGL-0210 — Core schema

Create schema/avgl-ir-v0.2.json with:

- [ ] avglVersion
- [ ] generatedAt
- [ ] sources
- [ ] analysis
- [ ] spaces
- [ ] objects
- [ ] identities
- [ ] boundaries
- [ ] relations
- [ ] flows
- [ ] states
- [ ] transformations
- [ ] derivations
- [ ] effectiveStates
- [ ] evidence
- [ ] vocabularies
- [ ] synthesis
- [ ] unknowns
- [ ] invariants

### AVGL-0211 — Stable IDs

Define deterministic IDs for:

- [ ] repository spaces;
- [ ] folder spaces;
- [ ] file objects;
- [ ] semantic identities;
- [ ] relations;
- [ ] evidence records;
- [ ] effective-state records.

IDs must not depend on renderer order.

### AVGL-0212 — Evidence records

Normalize evidence into reusable top-level records containing:

- [ ] source location;
- [ ] source kind;
- [ ] evidence state;
- [ ] confidence;
- [ ] extractor/detector;
- [ ] optional snippet;
- [ ] coverage limitations where relevant.

### AVGL-0213 — Relation schema

Every relation must define:

- [ ] id;
- [ ] type;
- [ ] from;
- [ ] to;
- [ ] direction semantics;
- [ ] evidence refs;
- [ ] evidence state;
- [ ] confidence;
- [ ] optional scope;
- [ ] optional precedence;
- [ ] optional vocabulary;
- [ ] optional effect class.

### AVGL-0214 — Vocabulary schema

Define separate vocabularies:

- [ ] filesystem;
- [ ] repository;
- [ ] agentic;
- [ ] context;
- [ ] workflow;
- [ ] data;
- [ ] runtime;
- [ ] governance;
- [ ] evidence.

WHO…DID must live under agentic/governance semantics rather than defining universal object type.

### AVGL-0215 — Semantic claims contract stabilization

Owner-adopted 2026-09-19 from a second dispositioned external input ([docs/AVGL_SEMANTIC_IR_STABILIZATION_INPUT_2026-09-19.md](./docs/AVGL_SEMANTIC_IR_STABILIZATION_INPUT_2026-09-19.md)). Prerequisite for AVGL-0277/AVGL-0287: the semantic claims layer must be a stable contract before context/role projections consume it. The semantic claims layer is the agentic-vocabulary claims contract feeding identities/evidence into the v0.2 IR — it is not the universal kernel and not a runtime/call/dependency graph.

Observed baseline (main @ f8ce7bf): resolver provenance (resolver, rule, reason, mode) already partially emitted by src/semantic-resolution.js including a `legacy.lexical.v0` fallback; confidence is numeric; 5 of 8 negative canonical fixtures and the synthesize pipeline expectation are red on main.

- [x] Every emitted semantic classification carries resolver provenance (resolver id incl. version, rule, mode SEMANTIC/LEXICAL_FALLBACK, reason), propagated consistently into the IR.
- [x] Every claim carries evidence refs (source path, line span where available, bounded excerpt, category implementation/configuration/documentation/test).
- [x] Confidence stays orthogonal to the canonical evidence states (EXPLICIT/INFERRED/OBSERVED/UNKNOWN, SoT §15); any confidence vocabulary is defined schema-first and must not duplicate or weaken evidence states.
- [x] Unknown stays unknown: absent evidence never becomes a false or negative claim.
- [x] Forbidden shortcuts asserted by negative tests: name matching, documentation inflation, permission inflation, receipt inflation.
- [x] Declared-only relations: no calls/dependency topology without a relation resolver (P4 evidence gates apply).
- [x] Class vocabulary changes require an explicit Source of Truth revision (§28); no parallel ADR process is introduced.
- [x] Contract lands as schema/JSON fields, not TypeScript artifacts.
- [x] Semantic-resolution subset of the currently red main suite is green: 5 red negative canonical fixtures, canonical negatives, documentation-alone, DID acceptance, synthesize pipeline expectation.
- [x] UI/icon renderers only consume the contract; they never derive meaning from filename, icon, color, position, or keywords alone (strengthens AVGL-0287).

Out of scope: the mobile-first layout test failure on main (separate defect, not semantic-resolution scope).

## Gate P1

Schema review must prove:

~~~text
file != identity
containment != inheritance
relation != evidence
declared state != effective state
WHO…DID != universal kernel
~~~

## DoD P1

- [ ] Minimal fixture validates.
- [ ] Rich multi-identity fixture validates.
- [ ] Effective-state fixture validates.
- [ ] Invalid underspecified relation fixtures fail.
- [ ] v0.1 semantics fit without defining the universal kernel.

---

# PHASE 2 — Structural discovery and materialization

## Purpose

Unify the current repository inventory and semantic pipeline.

## Tickets

### AVGL-0220 — Repository space

- [ ] Materialize repository root as SPACE.
- [ ] Preserve source/ref metadata.
- [ ] Bind scan coverage to the repository space.

### AVGL-0221 — Folder spaces

- [ ] Materialize folders as nested spaces.
- [ ] Emit explicit contains relations.
- [ ] Preserve observable unsupported/inaccessible limitations.
- [ ] Never infer inheritance from nesting alone.

### AVGL-0222 — File objects

- [ ] Materialize scanned/eligible files as objects.
- [ ] Preserve path, size, source kind, source ref.
- [ ] Link files to containing spaces.
- [ ] Link evidence to file objects.

### AVGL-0223 — Inventory/IR convergence

Refactor:

~~~text
GitHub inventory → Web tree
scanner inventory → semantic IR
~~~

into:

~~~text
source inventory
      ↓
AVGL structural IR
      ↓
structure projection / tree
~~~

- [ ] Web tree derives from IR.
- [ ] Repository inventory endpoint becomes derived/compatible rather than a second model.
- [ ] Renderer does not maintain a second semantic tree.

### AVGL-0224 — Coverage semantics

- [ ] Mark unreadable, unsupported, oversized, skipped surfaces.
- [ ] Keep secret exclusions default-deny.
- [ ] Distinguish complete topology from complete semantic-content coverage.

## Gate P2

A nested fixture must reproduce repository/folder/file structure from IR without Web-specific reconstruction.

## DoD P2

- [ ] Root/folder/file objects exist in IR.
- [ ] contains relations are explicit.
- [ ] Web tree renders from IR.
- [ ] Full-tree fallback tests remain green.
- [ ] Secret surfaces remain unread.

---

# PHASE 3 — Multi-identity and vocabularies

## Purpose

Allow one artifact to participate in several semantic dimensions.

## Tickets

### AVGL-0230 — Identity records

Implement:

- [ ] stable object reference;
- [ ] vocabulary;
- [ ] type;
- [ ] scope;
- [ ] evidence refs;
- [ ] evidence state;
- [ ] confidence.

### AVGL-0231 — Filesystem/repository identities

Support deterministic identities such as:

- [ ] file;
- [ ] config;
- [ ] documentation;
- [ ] implementation;
- [ ] test;
- [ ] schema;
- [ ] CI/repository automation.

### AVGL-0232 — Context identities

Initial deterministic identities:

- [ ] instruction source;
- [ ] prompt source;
- [ ] memory/context source;
- [ ] policy/context contributor;
- [ ] resource/knowledge source.

### AVGL-0233 — Agentic vocabulary migration

Move current classification into typed identities/claims while preserving behavior:

- [ ] WHO;
- [ ] KNOW;
- [ ] THINK;
- [ ] CAN;
- [ ] MAY;
- [ ] ACT;
- [ ] DID.

Current evidence-strength gates for MAY/ACT/DID remain mandatory.

### AVGL-0234 — Deduplication

- [ ] One object may have many identities.
- [ ] Repeated evidence must not create duplicate identical identities.
- [ ] Evidence aggregates deterministically.

## Gate P3

One AGENTS.md fixture can carry multiple identities without creating disconnected duplicate file objects.

## DoD P3

- [ ] Multi-identity tests PASS.
- [ ] Existing Story semantics still render.
- [ ] Identity evidence is inspectable.
- [ ] Object ID stays stable across vocabulary projections.

---

# PHASE 4 — Evidence-bound typed relations

## Purpose

Populate the relation layer without creating an assumption graph.

## Tickets

### AVGL-0240 — Relation registry

For each relation define:

- [ ] category;
- [ ] directionality;
- [ ] transitivity policy;
- [ ] allowed endpoints;
- [ ] evidence requirement;
- [ ] default projection behavior.

Initial types:

~~~text
contains
belongs_to
defines
references
imports
depends_on
reads
writes
calls
applies_to
inherits
overrides
shadows
extends
derives
resolves_to
contributes_to
composes_with
instantiates
invokes
executes_as
dispatches_to
affects
propagates_to
mutates
produces
verifies
~~~

### AVGL-0241 — Deterministic extraction

Start only with high-confidence relations:

- [ ] containment from repository tree;
- [ ] supported direct JS/TS import/reference relations;
- [ ] exact manifest/config references;
- [ ] explicit workflow/config links where an adapter proves both endpoints.

### AVGL-0242 — Relation evidence gate

- [ ] Every non-derived relation has evidence.
- [ ] Same-file co-occurrence never creates a relation.
- [ ] Ambiguous target resolution remains UNKNOWN/unresolved.
- [ ] Confidence never upgrades evidence state.

### AVGL-0243 — Traversal API

Provide:

- [ ] outgoing;
- [ ] incoming;
- [ ] filter by type/family;
- [ ] bounded traversal;
- [ ] cycle-safe traversal.

## Gate P4

Fixtures distinguish containment, dependency, and scope/inheritance as different semantics.

## DoD P4

- [ ] relations is no longer an untyped placeholder.
- [ ] Relation schema tests PASS.
- [ ] False-relation fixture emits no unsupported edge.
- [ ] Traversal is deterministic.

---

# PHASE 5 — Scope, inheritance, override, precedence

## Purpose

Implement the first material form of STRUCTURE = EFFECT.

## Support boundary

Start with explicit deterministic scope rules. Do not claim universal inheritance across arbitrary files.

Recommended first adapter:

~~~text
AGENTS.md-style hierarchical instruction scope
~~~

plus one controlled configuration-inheritance fixture.

## Tickets

### AVGL-0250 — Scope model

Represent:

- [ ] exact object scope;
- [ ] folder/subtree scope;
- [ ] repository scope;
- [ ] explicit target scope;
- [ ] unresolved scope.

### AVGL-0251 — Inheritance adapter

- [ ] Detect supported inherited instruction source.
- [ ] Emit applies_to / inherits with evidence.
- [ ] Never infer inheritance from filename similarity alone.
- [ ] Record the adapter/rule responsible.

### AVGL-0252 — Override/shadow

- [ ] Define precedence rules for the supported adapter.
- [ ] Emit overrides or shadows explicitly.
- [ ] Keep all declared sources visible.
- [ ] Keep lower-precedence sources in provenance.

### AVGL-0253 — Conflict handling

- [ ] Deterministic tie behavior where specified.
- [ ] Explicit conflict/UNKNOWN where precedence is undefined.
- [ ] Cycle detection.
- [ ] No silent winner selection under ambiguity.

## Gate P5

Fixture:

~~~text
/AGENTS.md
/apps/AGENTS.md
/apps/booking/agent.*
~~~

must show root scope, nested scope, explicit precedence, and preserved provenance.

## DoD P5

- [ ] Inheritance chain is navigable.
- [ ] Override chain is inspectable.
- [ ] Ambiguous inheritance fails closed.
- [ ] Containment-only fixture emits no inheritance.

---

# PHASE 6 — Derivation, effective state, propagation

## Purpose

Turn supported structural relations into explainable effective state.

## Tickets

### AVGL-0260 — Declared vs effective

Implement:

~~~text
DECLARED
→ inherited
→ overridden
→ composed
→ RESOLVED / EFFECTIVE
~~~

- [ ] Effective-state record references all contributors.
- [ ] Resolution method/version recorded.
- [ ] Unsupported fields remain UNKNOWN.

### AVGL-0261 — Provenance resolver

Given an effective property, return:

- [ ] direct source;
- [ ] inherited contributors;
- [ ] overridden contributors;
- [ ] deterministic winner where defined;
- [ ] evidence refs.

### AVGL-0262 — Propagation resolver

Given a source object/identity, return bounded downstream impact:

- [ ] direct affected objects;
- [ ] derived/effective states;
- [ ] supported downstream relation paths;
- [ ] cycle-safe traversal;
- [ ] path explanation.

### AVGL-0263 — Impact synthesis

Summaries must be computed only from traversable relations.

No impact may be generated from keyword proximity.

## Gate P6

IR alone can answer:

~~~text
Where did this effective instruction come from?
What can changing this source affect?
~~~

## DoD P6

- [ ] Provenance deterministic.
- [ ] Propagation deterministic.
- [ ] Effective != declared.
- [ ] Impact summaries match relation paths.
- [ ] Unknown propagation stays UNKNOWN.

---

# PHASE 7 — Lens and projection framework

## Purpose

Replace hard-coded view semantics with explicit projections over one model.

## Tickets

### AVGL-0270 — Lens contract

A lens can:

- [ ] select relevant object/identity/relation families;
- [ ] emphasize/collapse detail;
- [ ] retain stable object refs;
- [ ] expose evidence;
- [ ] declare required IR features.

### AVGL-0271 — Structure lens

Show:

- [ ] spaces/boundaries;
- [ ] containment;
- [ ] useful identity granularity;
- [ ] coverage limitations.

### AVGL-0272 — Evidence lens

Migrate current Inspect behavior:

- [ ] object → assertion → evidence;
- [ ] relation → evidence;
- [ ] effective state → contributor evidence.

### AVGL-0273 — Agentic/Narrative lens

Preserve WHO…DID as a vocabulary projection.

- [ ] Seven-class story remains available.
- [ ] It is explicitly not the universal kernel.
- [ ] CAN != MAY remains explicit.

### AVGL-0274 — Inheritance lens

Show:

- [ ] scope;
- [ ] inherited source;
- [ ] override;
- [ ] shadowed source;
- [ ] effective destination.

### AVGL-0275 — Propagation lens

Show:

- [ ] selected source;
- [ ] supported downstream paths;
- [ ] impact groups;
- [ ] evidence access.

### AVGL-0276 — Effective-State lens

Show:

- [ ] effective properties/identities;
- [ ] contributors;
- [ ] precedence;
- [ ] unresolved/conflict markers.

### AVGL-0277 — Context lens

Owner-adopted 2026-09-19 from dispositioned external input ([docs/AVGL_CONTEXTUAL_UNDERSTANDING_INPUT_2026-09-19.md](./docs/AVGL_CONTEXTUAL_UNDERSTANDING_INPUT_2026-09-19.md)). Materializes the SoT §5.2 Context lens family. For one selected object, the lens answers: **which role does this artifact play in the overall system?**

The context projection is a deterministic projection over the existing IR. It introduces no new resolver pipeline stage, no new file family, and no semantics absent from the IR.

- [ ] Role framing derived only from evidenced identities (vocabulary roles, including agentic WHO…DID where evidenced), shown as primary/related.
- [ ] Evidenced typed relations grouped by direction (e.g. reads/consumes inbound, produces/affects outbound); existing relation grammar only.
- [ ] Containing spaces shown as structural parents (containment only, never inheritance).
- [ ] Component/domain framing only when derivable from evidenced identities/relations.
- [ ] Evidence refs exposed for every asserted role, relation, and parent.
- [ ] Unknown roles/relations remain explicitly UNKNOWN; no adjacency- or filename-based framing.
- [ ] Stable object refs retained per the AVGL-0270 lens contract.

## Gate P7

Switching lenses must retain the same underlying selected object and must not create semantic duplication.

## DoD P7

- [ ] All required lenses derive from one IR.
- [ ] Story/Inspect survive as compatible projections.
- [ ] System view is reframed as Agentic/Governance where appropriate.
- [ ] No lens stores independent semantic truth.

---

# PHASE 8 — Spatial projection and navigation UI

## Purpose

Make SEE = UNDERSTAND = NAVIGATE true in the product.

## UX rule

Do not default to a force-directed graph.

Prefer:

- containment;
- zones;
- nested spaces;
- paths;
- bands;
- aligned causal/source directions;
- progressive disclosure;
- local relation diagrams only where useful.

## Tickets

### AVGL-0280 — Structural canvas

Represent:

- [ ] repository/folder spaces;
- [ ] object placement;
- [ ] meaningful boundaries;
- [ ] selected relation paths;
- [ ] identities without visual overload.

### AVGL-0281 — Navigation state

Maintain:

- [ ] selected object;
- [ ] selected identity;
- [ ] current lens;
- [ ] navigation path/breadcrumb;
- [ ] relation direction;
- [ ] evidence return point.

### AVGL-0282 — Follow relation

- [ ] forward;
- [ ] backward;
- [ ] preserve provenance trail;
- [ ] reveal relation type;
- [ ] reveal evidence.

### AVGL-0283 — Provenance action

One action answers:

> Where did this come from?

### AVGL-0284 — Propagation action

One action answers:

> What does this affect?

### AVGL-0285 — Effective-state action

One action answers:

> Why is this effective here?

### AVGL-0286 — Progressive disclosure

- [ ] Avoid raw edge explosion.
- [ ] Summarize groups.
- [ ] Expand locally.
- [ ] Preserve readable labels.
- [ ] Reveal exact technical evidence on demand.

### AVGL-0287 — Context role card and icon grammar

Owner-adopted 2026-09-19 from dispositioned external input ([docs/AVGL_CONTEXTUAL_UNDERSTANDING_INPUT_2026-09-19.md](./docs/AVGL_CONTEXTUAL_UNDERSTANDING_INPUT_2026-09-19.md)).

- [ ] Object card renders the AVGL-0277 context-lens framing: role, evidenced relations by direction, structural parents, evidence reference count.
- [ ] Relations on the card are navigable per AVGL-0282; evidence stays one step away per AVGL-0286.
- [ ] Icon/glyph families (actor, structure, cognition, capability, authority, effective, evidence) are renderer-level visual syntax only.
- [ ] Icon choice never encodes semantics absent from the IR (SoT §20/§21).
- [ ] Card remains usable in narrow/mobile layouts (AVGL-0280 boundary applies).

## Gate P8

A user can navigate:

~~~text
physical location
→ semantic identities
→ inherited/overriding sources
→ effective state
→ downstream impact
→ source evidence
~~~

without switching to an unrelated model.

## DoD P8

- [ ] Core navigation works by click/tap.
- [ ] Selected object survives lens switches.
- [ ] No graph hairball is the default.
- [ ] Evidence remains one navigation step away.
- [ ] Narrow/mobile layouts remain usable.

---

# PHASE 9 — API, CLI, and compatibility migration

## Purpose

Expose v0.2 consistently.

## Tickets

### AVGL-0290 — Analyzer output

- [ ] analyzeRepository exposes explicit v0.2 IR.
- [ ] GitHub analyzer returns same contract.
- [ ] Legacy projection adapter exists where needed.

### AVGL-0291 — CLI

Provide/adjust:

- [ ] json → v0.2 IR;
- [ ] story → Agentic lens;
- [ ] structure;
- [ ] evidence;
- [ ] optional inheritance/effective formats.

### AVGL-0292 — API

- [ ] /api/analyze returns versioned IR.
- [ ] repository/file endpoints derive from the same model where practical.
- [ ] chat consumes v0.2 context but never becomes structural truth.

### AVGL-0293 — Documentation

- [ ] README reflects universal kernel.
- [ ] v0.1 concept doc is clearly historical/baseline where needed.
- [ ] Source of Truth remains canonical.
- [ ] Schema docs include examples.

## Gate P9

CLI, local analyzer, GitHub analyzer, API, and Web agree on object IDs and relation semantics for the same source/ref.

## DoD P9

- [ ] Compatibility tests PASS.
- [ ] No public surface calls WHO…DID the universal AVGL kernel.
- [ ] Public docs match behavior.

---

# PHASE 10 — Verification and architecture acceptance

## Acceptance scenario A — Multi-identity

Given one instruction artifact:

- [ ] file identity visible;
- [ ] instruction-source identity visible;
- [ ] scope identity visible;
- [ ] agentic identity only where evidenced;
- [ ] all resolve to one underlying object.

## Scenario B — Inheritance and override

Given root + nested instruction sources:

- [ ] containment shown;
- [ ] inheritance shown separately;
- [ ] override shown separately;
- [ ] effective state computed;
- [ ] provenance includes all contributors.

## Scenario C — False relation resistance

Given unrelated semantic hits in one file:

- [ ] no unsupported call/dependency/inheritance relation emitted.

## Scenario D — Evidence downgrade resistance

Given documentation-only authority/effect claims:

- [ ] MAY/ACT/DID stay UNKNOWN where stronger evidence is required.

## Scenario E — Propagation

Given a supported scoped source:

- [ ] downstream impact derives from relations;
- [ ] unrelated files do not expand the impact set.

## Scenario F — Lens coherence

For one selected object, Structure, Agentic, Evidence, Inheritance, Propagation, and Effective-State lenses all reference the same object ID.

## Scenario G — Coverage limitation

Given a failed content fetch:

- [ ] scan is incomplete;
- [ ] unseen semantics remain UNKNOWN;
- [ ] structural vs content coverage stay distinguishable.

## Final architecture acceptance

All must answer yes:

- [ ] Can AVGL represent location without pretending location is effect?
- [ ] Can it represent effect without reducing effect to a generic edge?
- [ ] Can one artifact possess several identities without duplication?
- [ ] Can inheritance and override be inspected independently?
- [ ] Can effective state be explained from contributors?
- [ ] Can every structural assertion be traced to bounded evidence?
- [ ] Can users navigate structure and effect from one model?
- [ ] Does the UI avoid making a graph the default mental model?
- [ ] Does WHO…DID remain useful without defining the universal kernel?
- [ ] Is time still cleanly deferred?

## DoD P10 / Release Gate

- [ ] Gates P0–P9 PASS.
- [ ] Scenarios A–G PASS.
- [ ] npm test PASS.
- [ ] npm run check PASS.
- [ ] No open P0/P1 architecture defects.
- [ ] Source of Truth and implementation are consistent.
- [ ] Deferred work is recorded explicitly.

---

## 4. Required execution order

~~~text
P0 baseline
 ↓
P1 IR contract
 ↓
P2 structural materialization
 ↓
P3 multi-identity
 ↓
P4 typed relations
 ↓
P5 scope/inheritance/override
 ↓
P6 effective state/propagation
 ↓
P7 lenses
 ↓
P8 navigation UI
 ↓
P9 compatibility
 ↓
P10 acceptance
~~~

Do not build the new visual layer before P1–P6 are structurally sound. Otherwise the UI will encode semantics the IR cannot prove or serialize.

---

## 5. Test strategy

Every new semantic capability requires:

### Positive test

A supported source produces the expected object/identity/relation/state.

### Negative test

A superficially similar unsupported source does not produce the semantic claim.

### Provenance test

The claim points to correct evidence and can be traced projection → IR → source.

Also require:

- [ ] schema validation;
- [ ] stable ID determinism;
- [ ] cycle handling;
- [ ] partial coverage;
- [ ] conflicting precedence;
- [ ] cross-lens identity consistency;
- [ ] v0.1 Story compatibility.

---

## 6. Change discipline

For every implementation ticket:

- [ ] identify Source of Truth clauses affected;
- [ ] define deterministic evidence requirement;
- [ ] add positive test;
- [ ] add negative test;
- [ ] add provenance test;
- [ ] preserve UNKNOWN;
- [ ] update schema before emitting a new shape;
- [ ] update docs when public contract changes;
- [ ] run npm test;
- [ ] run npm run check.

A ticket is not complete merely because a renderer displays the desired result.

---

## 7. Deferred roadmap

### Temporal AVGL

~~~text
TIME = FIRST-CLASS PRIMITIVE
~~~

Later dimensions may include:

- execution history;
- system revision/evolution;
- state transitions;
- temporal provenance;
- replay/compare.

### Bidirectional AVGL

~~~text
SYSTEM ⇄ AVGL
~~~

Later capabilities:

- simulate;
- propose;
- patch planning;
- controlled apply.

### AVGL as source of truth

Later capabilities:

- authoritative serializable definitions;
- generation/reconciliation;
- policy-governed mutation;
- implementation drift detection.

None of these may compromise the architecture-first evidence-bound core built by this plan.
